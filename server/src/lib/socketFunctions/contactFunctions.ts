import Contact from "../../models/Contact.js";
import User from "../../models/User.js";
import {
  AddContactFunctionProps,
  UpdateGroupFunctionProps,
} from "../../types/socketFunctionTypes";
import { deleteFile } from "../upload.js";
import { Server as IOServer, Socket } from "socket.io";

export const addContact = async (
  contactData: AddContactFunctionProps,
  socket: Socket,
  userId: string,
  userSocketMap: Map<string, string>
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

export const groupUpdate = async (
  updatedContact: UpdateGroupFunctionProps,
  io: IOServer,
  userSocketMap: Map<string, string>
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

export const deleteGroup = async (
  contactId: string,
  io: IOServer,
  userSocketMap: Map<string, string>
) => {
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
