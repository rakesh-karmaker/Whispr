import config from "../config/config.js";
import { Server } from "http";
import { Server as IOServer, Socket } from "socket.io";
import User from "../models/User.js";
import Contact from "../models/Contact.js";
import {
  AddContactFunctionProps,
  AddParticipantFunctionProps,
  MakeAdminFunctionProps,
  RemoveParticipantFunctionProps,
  SendMessageFunctionProps,
  UpdateGroupFunctionProps,
} from "../types/socketFunctionTypes.js";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import { deleteFile } from "./upload.js";
import { MessageType } from "../types/messageTypes.js";
import scrapeURLMetaData from "./scrapeURLMetaData.js";
import getMessageType from "../utils/getMessageType.js";
import getMessageSummary from "../utils/getMessageSummary.js";

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
      groupUpdate(updatedContact, io)
    );

    socket.on("delete-group", async (contactId) => deleteGroup(contactId, io));

    socket.on("make-admin", (data) => makeAdmin(data, io, userId));

    socket.on("add-participants", (data) => addParticipant(data, io, userId));

    socket.on("remove-participant", (data) =>
      removeParticipant(data, io, userId)
    );

    socket.on("sendMessage", (data) => sendMessage(data, io, userId));

    socket.on("message-seen", (data) => messageSeen(data, io));

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
  io: IOServer
) => {
  const contact = await Contact.findById(updatedContact._id);
  if (contact) {
    const participants =
      contact.admins && contact.admins.length > 0
        ? [...contact.participants, ...contact.admins]
        : contact.participants;
    participants.forEach(async (participant) => {
      const socketId = userSocketMap.get(participant.toString());
      if (socketId) {
        io.to(socketId).emit("update-group", {
          ...updatedContact,
          updatedAt: contact.updatedAt,
        });
      }
    });
  }
};

const deleteGroup = async (contactId: string, io: IOServer) => {
  const contact = await Contact.findByIdAndDelete(contactId);
  if (!contact) return;

  const participants =
    contact.admins && contact.admins.length > 0
      ? [...contact.participants, ...contact.admins]
      : contact.participants;

  participants.forEach(async (participant) => {
    const socketId = userSocketMap.get(participant._id.toString());
    if (socketId) {
      io.to(socketId).emit("delete-group", {
        contactId,
      });
    }
    await User.updateOne(
      { _id: participant },
      { $pull: { contacts: contactId } }
    );
  });
  if (contact.publicId) {
    try {
      await deleteFile(contact.publicId);
    } catch (error) {
      console.log("Error deleting file:", error);
    }
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
          updatedAt: announcement.updatedAt,
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

const addParticipant = async (
  data: AddParticipantFunctionProps,
  io: IOServer,
  userId: string
) => {
  const contact = await Contact.findById(data.contactId);
  if (!contact) return;

  const participants =
    contact.admins && contact.admins.length > 0
      ? [...contact.participants, ...contact.admins]
      : contact.participants;

  data.participants.forEach(async (participant) => {
    contact.participants.push(new mongoose.Types.ObjectId(participant._id));
  });
  await contact.save();

  const user = await User.findById(userId).select("firstName");

  const announcement = await Message.create({
    chatId: new mongoose.Types.ObjectId(data.contactId),
    sender: userId,
    messageType: "announcement",
    announcer: user?.firstName,
    summary: `added ${data.participants.length > 1 ? `${data.participants.length} new participants` : data.participants[0].name} to the group`,
  });

  const lastMessages = await Message.find({
    chatId: new mongoose.Types.ObjectId(data.contactId),
  })
    .sort({ createdAt: -1 })
    .limit(10);
  if (!lastMessages) return;

  const contactData: AddContactFunctionProps = {
    _id: data.contactId,
    contactName: contact.name,
    contactImage: contact.image,
    isGroup: contact.isGroup,
    isActive: contact.isActive,
    updatedAt: contact.updatedAt,
    lastMessages: lastMessages.map((message) => ({
      content: message.content ?? "",
      messageType: message.messageType,
      seenBy: message.seenBy.map((seenBy) => seenBy.toString()),
      updatedAt: message.updatedAt,
      summary: message.summary ?? "",
      announcer: message.announcer ?? "",
      sender: { _id: message.sender.toString() },
    })),
  };

  data.participants.forEach(async (participant) => {
    const socketId = userSocketMap.get(participant._id.toString());
    if (socketId) {
      io.to(socketId).emit("add-contact", contactData);
    }
  });

  participants.forEach(async (participant) => {
    const socketId = userSocketMap.get(participant._id.toString());
    if (socketId) {
      io.to(socketId).emit("add-participant", {
        ...data,
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

const removeParticipant = async (
  data: RemoveParticipantFunctionProps,
  io: IOServer,
  userId: string
) => {
  const contact = await Contact.findByIdAndUpdate(data.contactId, {
    $pull: {
      participants: data.participantId,
      admins: data.participantId,
    },
  });
  if (!contact) return;

  // update the participant's pinned messages
  await User.updateOne(
    { _id: data.participantId },
    { $pull: { pinnedContacts: data.contactId } }
  );

  const participants =
    contact.admins && contact.admins.length > 0
      ? [...contact.participants, ...contact.admins]
      : contact.participants;

  const user = await User.findById(userId).select("firstName");
  const participantData = await User.findById(data.participantId).select(
    "_id name avatar"
  );

  const announcement = await Message.create({
    chatId: new mongoose.Types.ObjectId(data.contactId),
    sender: userId,
    messageType: "announcement",
    announcer: user?.firstName,
    summary: `removed ${participantData?.name} from the group`,
  });

  participants.forEach(async (participant) => {
    const socketId = userSocketMap.get(participant._id.toString());
    if (socketId) {
      io.to(socketId).emit("remove-participant", {
        participantData,
        contactId: data.contactId,
        updatedAt: contact.updatedAt,
        announcement: {
          content: announcement.content,
          messageType: announcement.messageType,
          seenBy: announcement.seenBy,
          updatedAt: announcement.updatedAt,
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

const sendMessage = async (
  data: SendMessageFunctionProps,
  io: IOServer,
  userId: string
) => {
  console.log(data);
  // Find the contact
  const contact = await Contact.find({
    $and: [
      {
        _id: new mongoose.Types.ObjectId(data.chatId),
      },
      {
        $or: [
          {
            participants: { $elemMatch: { $eq: userId } },
          },
          {
            admins: { $elemMatch: { $eq: userId } },
          },
        ],
      },
    ],
  });

  if (!contact) return;

  const sender = await User.findById(userId);

  if (!sender) return;

  // check if link is present in the message
  const linkRegex = /https?:\/\/[^\s]+/g;
  const links = data.message.match(linkRegex);

  const messageType = getMessageType(
    data.files.images.length > 0,
    data.files.files.length > 0,
    !!links && links.length > 0
  );

  // Handle message sending logic here
  const message = await Message.create({
    chatId: new mongoose.Types.ObjectId(data.chatId),
    sender: userId,
    content: data.message,
    messageType,
    link: {
      url: links && links.length > 0 ? links[0] : null,
    },
    files: [
      ...data.files.images.map((image) => ({
        url: image.url,
        publicId: image.publicId,
        size: image.size,
      })),
      ...data.files.files.map((file) => ({
        url: file.url,
        publicId: file.publicId,
        size: file.size,
      })),
    ],
    summary: getMessageSummary(data, !!links && links.length > 0, messageType),
  });

  const participants =
    contact[0].admins && contact[0].admins.length > 0
      ? [...contact[0].participants, ...contact[0].admins]
      : contact[0].participants;

  const formattedMessage: MessageType = {
    _id: message._id.toString(),
    chatId: message.chatId.toString(),
    senderDetails: {
      _id: sender._id.toString(),
      name: sender.name,
      avatar: sender.avatar,
    },
    content: message.content,
    messageType: message.messageType,
    seenBy: message.seenBy.map((seenBy) => seenBy.toString()),
    createdAt: message.createdAt,
    updatedAt: new Date(message.updatedAt),
    summary: message.summary,
  };

  // add files
  if (data.files.images.length > 0 || data.files.files.length > 0) {
    formattedMessage.files = message.files;
  }

  // get the meta tags if url exists
  if (links && links.length > 0) {
    const metaData = await scrapeURLMetaData(links[0]);
    formattedMessage.link = {
      url: links[0],
      imageURL: metaData.imageURL,
      title: metaData.title,
      description: metaData.description,
    };
  }

  console.log(formattedMessage);

  for (const [id, socketId] of userSocketMap) {
    if (participants.some((participant) => participant._id.toString() === id)) {
      io.to(socketId).emit("sendMessage", formattedMessage);
    }
  }
};

const messageSeen = async (
  data: { messageId: string; chatId: string; seenBy: string },
  io: IOServer
) => {
  const messages = await Message.find({
    chatId: new mongoose.Types.ObjectId(data.chatId),
    _id: { $lte: new mongoose.Types.ObjectId(data.messageId) },
    seenBy: { $ne: new mongoose.Types.ObjectId(data.seenBy) },
    sender: { $ne: new mongoose.Types.ObjectId(data.seenBy) },
  }).sort({ createdAt: -1 });

  const sendersWithNoSeen = messages
    .filter((message) => {
      return message.seenBy.length === 0;
    })
    .map((message) => message.sender.toString());

  messages.forEach(async (message) => {
    message.seenBy.push(new mongoose.Types.ObjectId(data.seenBy));
    await message.save();
  });

  sendersWithNoSeen.forEach(async (senderId) => {
    const socketId = userSocketMap.get(senderId);
    if (socketId) {
      io.to(socketId).emit("message-seen", {
        messageId: data.messageId,
        chatId: data.chatId,
        seenBy: data.seenBy,
      });
    }
  });

  const userSocketId = userSocketMap.get(data.seenBy);
  if (userSocketId) {
    io.to(userSocketId).emit("message-saw", {
      messageIds: messages.map((message) => message._id.toString()),
      chatId: data.chatId,
    });
  }
};

export default setUpSocket;
