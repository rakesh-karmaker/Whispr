import mongoose from "mongoose";
import {
  AddContactFunctionProps,
  AddParticipantFunctionProps,
  MakeAdminFunctionProps,
  RemoveParticipantFunctionProps,
} from "../../types/socketFunctionTypes";
import { Server as IOServer } from "socket.io";
import User from "../../models/User.js";
import Message from "../../models/Message.js";
import Contact from "../../models/Contact.js";

export const addParticipant = async (
  data: AddParticipantFunctionProps,
  io: IOServer,
  userId: string,
  userSocketMap: Map<string, string>
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
          _id: announcement._id.toString(),
          content: announcement.content,
          messageType: announcement.messageType,
          seenBy: announcement.seenBy,
          createdAt: announcement.createdAt,
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

export const makeAdmin = async (
  data: MakeAdminFunctionProps,
  io: IOServer,
  userId: string,
  userSocketMap: Map<string, string>
) => {
  const contact = await Contact.findById(data.contactId);
  if (!contact) return;

  if (data.makeAdmin && contact) {
    if (
      contact.admins.some(
        (admin) => admin._id.toString() === data.participantId
      )
    )
      return;

    contact.participants.splice(
      contact.participants.findIndex(
        (participant) => participant._id.toString() === data.participantId
      ),
      1
    );
    contact.admins.push(new mongoose.Types.ObjectId(data.participantId));
    await contact.save();
  } else if (!data.makeAdmin && contact) {
    if (
      !contact.admins.some(
        (admin) => admin._id.toString() === data.participantId
      )
    )
      return;

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
          _id: announcement._id.toString(),
          content: announcement.content,
          messageType: announcement.messageType,
          seenBy: announcement.seenBy,
          createdAt: announcement.createdAt,
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

export const removeParticipant = async (
  data: RemoveParticipantFunctionProps,
  io: IOServer,
  userId: string,
  userSocketMap: Map<string, string>
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
          _id: announcement._id.toString(),
          content: announcement.content,
          messageType: announcement.messageType,
          seenBy: announcement.seenBy,
          updatedAt: announcement.updatedAt,
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
