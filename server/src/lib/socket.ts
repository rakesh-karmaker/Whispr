import config from "../config/config.js";
import { Server } from "http";
import { Server as IOServer, Socket } from "socket.io";
import User from "../models/User.js";
import Contact from "../models/Contact.js";
import {
  AddContactFunctionProps,
  MakeAdminFunctionProps,
  UpdateGroupFunctionProps,
} from "../types/socketFunctionTypes.js";
import mongoose from "mongoose";
import Message from "../models/Message.js";

const userSocketMap = new Map<string, string>();

const setUpSocket = (server: Server) => {
  const io = new IOServer(server, {
    cors: {
      origin: config.clientUrl,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

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
      userSocketMap.set(userId, socket.id.toString());
      await updateUserActiveStatus(socket, userSocketMap, userId, true);
      console.log(
        `"User connected:", userId: ${userId}, socketId: ${socket.id}`
      );
    } else {
      console.log("No user ID provided");
    }

    socket.on("add-contact", async (contactData) =>
      addContact(contactData, socket, userId)
    );

    socket.on("update-group", (updatedContact) =>
      groupUpdate(updatedContact, socket)
    );

    socket.on("make-admin", (data) => makeAdmin(data, io, userId));

    socket.on("disconnect", () => disconnect(socket));
  });
};

const addContact = async (
  contactData: AddContactFunctionProps,
  socket: Socket,
  userId: string
) => {
  const contact = await Contact.findById(contactData._id);

  if (contact) {
    const participants =
      contact.admins && contact.admins.length > 0
        ? [...contact.participants, ...contact.admins]
        : contact.participants;
    participants.forEach(async (participant) => {
      const socketId = userSocketMap.get(participant.toString());
      if (!contact.isGroup) {
        const user = await User.findById(userId);
        if (user) {
          contactData.contactName = user.name;
          contactData.contactImage = user.avatar;
        }
      }

      if (socketId && socketId !== socket.id) {
        socket.to(socketId).emit("add-contact", contactData);
      }
    });
  }
};

const groupUpdate = async (
  updatedContact: UpdateGroupFunctionProps,
  socket: Socket
) => {
  const contact = await Contact.findById(updatedContact._id);
  if (contact) {
    const participants =
      contact.admins && contact.admins.length > 0
        ? [...contact.participants, ...contact.admins]
        : contact.participants;
    participants.forEach(async (participant) => {
      const socketId = userSocketMap.get(participant.toString());
      if (socketId && socketId !== socket.id) {
        socket.to(socketId).emit("update-group", {
          ...updatedContact,
          updatedAt: contact.updatedAt,
        });
      }
    });
  }
};

const makeAdmin = async (
  data: MakeAdminFunctionProps,
  io: IOServer,
  userId: string
) => {
  const contact = await Contact.findById(data.contactId);
  if (!contact) return;

  if (data.makeAdmin && contact) {
    contact.participants.splice(
      contact.participants.findIndex(
        (participant) => participant._id.toString() === data.participantId
      ),
      1
    );
    contact.admins.push(new mongoose.Types.ObjectId(data.participantId));
    await contact.save();
  } else if (!data.makeAdmin && contact) {
    contact.admins.splice(
      contact.admins.findIndex(
        (admin) => admin._id.toString() === data.participantId.toString()
      ),
      1
    );
    contact.participants.push(new mongoose.Types.ObjectId(data.participantId));
  }

  await contact.save();
  await contact.populate("participants", "_id name avatar");
  await contact.populate("admins", "_id name avatar");

  const participants =
    contact.admins && contact.admins.length > 0
      ? [...contact.participants, ...contact.admins]
      : contact.participants;

  const participantData = await User.findById(data.participantId).select(
    "_id name avatar"
  );
  const user = await User.findById(userId);

  // create a new announcement
  const announcement = await Message.create({
    chatId: new mongoose.Types.ObjectId(data.contactId),
    sender: userId,
    messageType: "announcement",
    announcer: user?.firstName,
    summary: data.makeAdmin
      ? `added ${participantData?.name} as admin`
      : `removed ${participantData?.name} as admin`,
  });

  participants.forEach(async (participant) => {
    const socketId = userSocketMap.get(participant._id.toString());
    if (socketId) {
      io.to(socketId).emit("make-admin", {
        participantData,
        makeAdmin: data.makeAdmin,
        contactId: data.contactId,
        updatedAt: contact.updatedAt,
        announcement: {
          content: announcement.content,
          messageType: announcement.messageType,
          seenBy: announcement.seenBy,
          createdAt: announcement.createdAt,
          summary: announcement.summary,
          announcer: announcement.announcer,
          sender: {
            _id: announcement.sender,
          },
        },
      });
    }
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
