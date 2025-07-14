import config from "../config/config.js";
import { Server } from "http";
import { Server as IOServer, Socket } from "socket.io";
import User from "../models/User.js";
import Contact from "../models/Contact.js";

const setUpSocket = (server: Server) => {
  const io = new IOServer(server, {
    cors: {
      origin: config.clientUrl,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map<string, string>();

  const disconnect = async (socket: Socket) => {
    console.log(`User disconnected: ${socket.id}`);

    for (const [userId, socketId] of userSocketMap) {
      if (socketId === socket.id) {
        await updateUserActiveStatus(socket, userSocketMap, userId, false);
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      await updateUserActiveStatus(socket, userSocketMap, userId, true);
      console.log(
        `"User connected:", userId: ${userId}, socketId: ${socket.id}`
      );
    } else {
      console.log("No user ID provided");
    }

    socket.on("disconnect", () => disconnect(socket));
  });
};

const updateUserActiveStatus = async (
  socket: Socket,
  userSocketMap: Map<string, string>,
  userId: string,
  isActive: boolean
) => {
  await User.updateOne({ _id: userId }, { $set: { isActive } });
  const dms = await Contact.find({
    participants: userId,
    isGroup: false,
  })
    .populate("participants", "_id name avatar isActive")
    .sort({ updatedAt: -1 })
    .select("participants");

  // Get all related users
  const users: { userId: string; contactId: string }[] = [];
  dms.forEach((dm) => {
    dm.participants.forEach((participant) => {
      if (participant._id.toString() === userId) return;
      users.push({
        userId: participant._id.toString(),
        contactId: dm._id.toString(),
      });
    });
  });

  // Emit to all related users
  for (const [id, socketId] of userSocketMap) {
    if (users.some((user) => user.userId === id)) {
      const contactId = users.find((user) => user.userId === id)?.contactId;
      socket.to(socketId).emit("updateUserActiveStatus", {
        contactId,
        isActive,
      });
    }
  }
};

export default setUpSocket;
