import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import User from "../models/User.js";
import getDate from "../utils/getDate.js";
import { Request, Response } from "express";
import Message from "../models/Message.js";
import { MessageType } from "../types/modelType.js";
import { searchContactsQuery } from "../queries/searchQueries.js";
import {
  getAllContactsQuery,
  getContactQuery,
} from "../queries/contactQueries.js";

export async function searchContacts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { searchTerm, pageNumber } = req.query;
    if (!searchTerm || !pageNumber) {
      res.status(400).send({ message: "Please provide a search term" });
      return;
    }

    const allUsers = await searchContactsQuery(
      searchTerm as string,
      pageNumber as unknown as number,
      req
    );

    const hasMore = allUsers.length > 0;

    res.status(200).send({
      contacts: allUsers,
      hasMore,
    });
  } catch (err) {
    console.log("Error searching contacts - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function getAllContacts(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.pageNumber as string, 10);
    if (isNaN(page) || page < 1) {
      res.status(400).send({ message: "Invalid page number" });
      return;
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    // get pinned contacts' ids
    const user = await User.findById(objectUserId)
      .select("pinnedContacts")
      .lean();
    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }
    const pinnedContactIds = user.pinnedContacts || [];
    let pinnedContactsWithMessages = [];

    // Only fetch pinned contacts on page 1
    if (page === 1) {
      pinnedContactsWithMessages = await getAllContactsQuery(
        objectUserId,
        { _id: { $in: pinnedContactIds } },
        0,
        1
      );
    }

    // Get all contacts excluding pinned contacts
    const allContacts = await getAllContactsQuery(
      objectUserId,
      {
        $and: [
          { $or: [{ participants: objectUserId }, { admins: objectUserId }] },
          { _id: { $nin: pinnedContactIds } },
        ],
      },
      10,
      page
    );

    const hasMore = allContacts.length > 0;
    res.status(200).send({
      pinnedContacts: pinnedContactsWithMessages,
      contacts: allContacts,
      hasMore,
    });
  } catch (err) {
    console.log("Error getting all contacts - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function getContact(req: Request, res: Response): Promise<void> {
  try {
    const { chatId } = req.query;
    if (!chatId) {
      res.status(400).send({ message: "Invalid request" });
      return;
    }

    const objectChatId = new mongoose.Types.ObjectId(chatId as string);
    const contact = await getContactQuery(objectChatId);
    if (contact.length === 0) {
      res.status(404).send({ message: "Contact not found" });
      return;
    }

    const userId = new mongoose.Types.ObjectId(req.userId as string);
    const isUserPresent = [
      ...contact[0].participants,
      ...contact[0].admins,
    ].some((participant) => participant._id.toString() === userId.toString());

    if (!isUserPresent) {
      res.status(403).send({ message: "Forbidden" });
      return;
    }

    if (!contact[0].isGroup) {
      contact[0].participants.forEach(
        (participant: {
          _id: string;
          name: string;
          avatar: string;
          isActive: boolean;
        }) => {
          if (participant._id.toString() !== req.userId) {
            contact[0].name = participant.name;
            contact[0].image = participant.avatar;
            contact[0].isActive = participant.isActive;
          }
        }
      );
    }

    const allAssets = await Message.find({
      $and: [
        { chatId: objectChatId },
        {
          messageType: {
            $not: {
              $in: ["announcement", "text"],
            },
          },
        },
      ],
    });

    // Count images, files, and links
    let imagesCount: number = 0;
    let filesCount: number = 0;
    let linksCount: number = 0;
    allAssets.forEach((asset: MessageType) => {
      if (asset.messageType === "link") {
        linksCount++;
      } else if (asset.messageType === "image") {
        imagesCount += asset.files ? asset.files.length : 0;
      } else if (asset.messageType === "file") {
        filesCount += asset.files ? asset.files.length : 0;
      } else if (asset.messageType === "hybrid") {
        asset.files?.forEach((file) => {
          if (file.publicId.startsWith("whispr/images/")) {
            imagesCount++;
          } else {
            filesCount++;
          }
        });
      }
    });

    res.status(200).send({
      contactData: {
        _id: contact[0]._id.toString(),
        name: contact[0].name,
        isGroup: contact[0].isGroup,
        image: contact[0].image,
        socialLinks: contact[0].socialLinks,
        createdAt: contact[0].createdAt,
        participants: contact[0].participants,
        admins: contact[0].admins,
        isActive: contact[0].isActive,
        // participantsCount: participantsCount,
      },
      imagesCount,
      filesCount,
      linksCount,
    });
  } catch (err) {
    console.log("Error getting contact - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function changeContactPinStatus(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { chatId, willPin } = req.body;
    if (!chatId || typeof willPin !== "boolean") {
      res.status(400).send({ message: "Invalid request" });
      return;
    }

    const contact = await Contact.findOne({ _id: chatId });
    if (!contact) {
      res.status(404).send({ message: "Contact not found" });
      return;
    }

    const objectChatId = new mongoose.Types.ObjectId(chatId);
    if (willPin) {
      await User.updateOne(
        { _id: req.userId },
        { $push: { pinnedContacts: objectChatId } }
      );
    } else {
      await User.updateOne(
        { _id: req.userId },
        { $pull: { pinnedContacts: objectChatId } }
      );
    }
    res.status(200).send({ contactId: chatId, pinned: willPin });
  } catch (err) {
    console.log("Error pinning contact - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function createNewContact(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { _id } = req.body;
    if (!_id) {
      res.status(400).send({ message: "Invalid request" });
      return;
    }

    const objectId = new mongoose.Types.ObjectId(_id);
    const objectUserId = new mongoose.Types.ObjectId(req.userId);

    const contact = await Contact.find({
      $and: [
        { $and: [{ participants: objectId }, { participants: objectUserId }] },
        { isGroup: false },
      ],
    });
    if (contact.length > 0) {
      res.status(200).send({ chatId: contact[0]._id.toString() });
      return;
    }

    const participant = await User.findById(objectId);
    if (!participant) {
      res.status(404).send({ message: "Participant not found" });
      return;
    }

    const newContact = await Contact.create({
      participants: [objectUserId, objectId],
      isGroup: false,
      isActive: participant.isActive,
    });

    const user = await User.findById(objectUserId).select("firstName");
    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    const createdMessage = await Message.create({
      chatId: newContact._id,
      sender: objectUserId,
      messageType: "announcement",
      summary: "created a new contact",
      announcer: user.firstName,
    });

    res.status(200).send({
      contactData: {
        _id: newContact._id.toString(),
        contactName: participant.name,
        contactImage: participant.avatar,
        isGroup: newContact.isGroup,
        isActive: newContact.isActive,
        updatedAt: newContact.updatedAt,
        lastMessages: [createdMessage],
      },
    });
  } catch (err) {
    console.log("Error creating new contact - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}
