import { SendMessageFunctionProps } from "../../types/socketFunctionTypes";
import Message from "../../models/Message.js";
import Contact from "../../models/Contact.js";
import User from "../../models/User.js";
import mongoose from "mongoose";
import { Server as IOServer } from "socket.io";
import { MessageType } from "../../types/messageTypes";
import getMessageType from "../../utils/getMessageType.js";
import getMessageSummary from "../../utils/getMessageSummary.js";
import scrapeURLMetaData from "../scrapeURLMetaData.js";

export const sendMessage = async (
  data: SendMessageFunctionProps,
  io: IOServer,
  userId: string,
  userSocketMap: Map<string, string>
) => {
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

  for (const [id, socketId] of userSocketMap) {
    if (participants.some((participant) => participant._id.toString() === id)) {
      io.to(socketId).emit("sendMessage", formattedMessage);
    }
  }
};

export const messageSeen = async (
  data: { messageId: string; chatId: string; seenBy: string },
  io: IOServer,
  userSocketMap: Map<string, string>
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
