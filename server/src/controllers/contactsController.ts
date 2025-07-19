import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import User from "../models/User.js";
import getDate from "../utils/getDate.js";
import { Request, Response } from "express";
import Message from "../models/Message.js";
import { deleteFile, uploadFile } from "../lib/upload.js";
import addImageMetaTag from "../utils/addImageMetaTag.js";

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

    const sanitizedSearchTerm = (searchTerm as string).replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const includesRegex = new RegExp(sanitizedSearchTerm, "i");

    const allUsers = await User.find({
      $and: [
        { _id: { $ne: req.userId } },
        {
          $or: [
            { name: { $regex: includesRegex } },
            { firstName: { $regex: includesRegex } },
            { lastName: { $regex: includesRegex } },
            { email: { $regex: includesRegex } },
          ],
        },
      ],
    })
      .select("name firstName lastName email avatar isActive")
      .limit(10)
      .skip(((pageNumber as unknown as number) - 1) * 10);

    const hasMore = allUsers.length === 10;

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
      pinnedContactsWithMessages = await Contact.aggregate([
        {
          $match: {
            _id: { $in: pinnedContactIds },
          },
        },
        // Lookup participant user info
        {
          $lookup: {
            from: "users",
            localField: "participants",
            foreignField: "_id",
            as: "participantDetails",
          },
        },
        // Lookup last 10 messages
        {
          $lookup: {
            from: "messages",
            let: { chatId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$chatId", "$$chatId"] } } },
              { $sort: { createdAt: -1 } },
              { $limit: 10 },
              {
                $lookup: {
                  from: "users",
                  localField: "sender",
                  foreignField: "_id",
                  as: "senderDetails",
                },
              },
              { $unwind: "$senderDetails" },
              {
                $project: {
                  content: 1,
                  messageType: 1,
                  createdAt: 1,
                  seenBy: 1,
                  summary: 1,
                  announcer: 1,
                  sender: {
                    _id: "$senderDetails._id",
                    name: "$senderDetails.name",
                    avatar: "$senderDetails.avatar",
                  },
                },
              },
            ],
            as: "lastMessages",
          },
        },
        // Get the other user in DM chats
        {
          $addFields: {
            otherParticipant: {
              $first: {
                $filter: {
                  input: "$participantDetails",
                  as: "p",
                  cond: {
                    $ne: ["$$p._id", new mongoose.Types.ObjectId(userId)],
                  },
                },
              },
            },
          },
        },
        // Set display name & image based on group or DM
        {
          $addFields: {
            contactName: {
              $cond: {
                if: "$isGroup",
                then: "$name",
                else: "$otherParticipant.name",
              },
            },
            contactImage: {
              $cond: {
                if: "$isGroup",
                then: "$image",
                else: "$otherParticipant.avatar",
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            isGroup: 1,
            isActive: "$otherParticipant.isActive",
            updatedAt: 1,
            contactName: 1,
            contactImage: 1,
            lastMessages: 1,
          },
        },
        { $sort: { updatedAt: -1 } },
      ]);
    }

    // Get non-pinned contacts with messages
    const allContacts = await Contact.aggregate([
      {
        $match: {
          $and: [
            { $or: [{ participants: objectUserId }, { admins: objectUserId }] },
            { _id: { $nin: pinnedContactIds } },
          ],
        },
      },
      // Get participant user info
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participantDetails",
        },
      },
      // Get last 10 messages for each chat
      {
        $lookup: {
          from: "messages",
          let: { chatId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$chatId", "$$chatId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "senderDetails",
              },
            },
            { $unwind: "$senderDetails" },
            {
              $project: {
                content: 1,
                messageType: 1,
                createdAt: 1,
                seenBy: 1,
                summary: 1,
                announcer: 1,
                sender: {
                  _id: "$senderDetails._id",
                  name: "$senderDetails.name",
                  avatar: "$senderDetails.avatar",
                },
              },
            },
          ],
          as: "lastMessages",
        },
      },
      // Extract the "other" participant for DMs
      {
        $addFields: {
          otherParticipant: {
            $first: {
              $filter: {
                input: "$participantDetails",
                as: "p",
                cond: { $ne: ["$$p._id", objectUserId] },
              },
            },
          },
        },
      },
      // Add display fields
      {
        $addFields: {
          contactName: {
            $cond: {
              if: "$isGroup",
              then: "$name",
              else: "$otherParticipant.name",
            },
          },
          contactImage: {
            $cond: {
              if: "$isGroup",
              then: "$image",
              else: "$otherParticipant.avatar",
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          isGroup: 1,
          isActive: "$otherParticipant.isActive",
          updatedAt: 1,
          contactName: 1,
          contactImage: 1,
          lastMessages: 1,
        },
      },
      { $skip: (page - 1) * 10 },
      { $limit: 10 },
      { $sort: { updatedAt: -1 } },
    ]);

    const hasMore = allContacts.length === 10;
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
    const contact = await Contact.aggregate([
      { $match: { _id: objectChatId } },
      // get the 1st 4 participants
      {
        $lookup: {
          from: "users",
          localField: "participants",
          foreignField: "_id",
          as: "participants",
          pipeline: [
            { $limit: 4 },
            { $project: { _id: 1, name: 1, avatar: 1, isActive: 1 } },
          ],
        },
      },
      // get all admins
      {
        $lookup: {
          from: "users",
          localField: "admins",
          foreignField: "_id",
          as: "admins",
          pipeline: [{ $project: { _id: 1, name: 1, avatar: 1, isActive: 1 } }],
        },
      },
      // get last 15 messages
      {
        $lookup: {
          from: "messages",
          let: { chatId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$chatId", "$$chatId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 15 },
          ],
          as: "lastMessages",
        },
      },
      {
        $project: {
          _id: 1,
          isGroup: 1,
          socialLinks: 1,
          createdAt: 1,
          participants: 1,
          admins: 1,
          isActive: 1,
          lastMessages: 1,
          name: 1,
          image: 1,
        },
      },
    ]);
    if (contact.length === 0) {
      res.status(404).send({ message: "Contact not found" });
      return;
    }

    const participantsCount = await Contact.find({ _id: objectChatId });
    contact[0].lastMessages = await addImageMetaTag(contact[0].lastMessages);
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
        participantsCount:
          participantsCount[0].participants.length +
          (participantsCount[0].admins && participantsCount[0].admins.length
            ? participantsCount[0].admins.length
            : 0),
      },
      lastMessages: contact[0].lastMessages,
    });
  } catch (err) {
    console.log("Error getting contact - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function pinContact(req: Request, res: Response): Promise<void> {
  try {
    const { chatId } = req.body;
    if (!chatId) {
      res.status(400).send({ message: "Invalid request" });
      return;
    }

    const contact = await Contact.findOne({ _id: chatId });
    if (!contact) {
      res.status(404).send({ message: "Contact not found" });
      return;
    }

    const objectChatId = new mongoose.Types.ObjectId(chatId);
    await User.updateOne(
      { _id: req.userId },
      { $push: { pinnedContacts: objectChatId } }
    );
    res.status(200).send({ contactId: chatId, pinned: true });
  } catch (err) {
    console.log("Error pinning contact - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function unpinContact(req: Request, res: Response): Promise<void> {
  try {
    const { chatId } = req.body;
    if (!chatId) {
      res.status(400).send({ message: "Invalid request" });
      return;
    }

    const contact = await Contact.findOne({ _id: chatId });
    if (!contact) {
      res.status(404).send({ message: "Contact not found" });
      return;
    }

    const objectChatId = new mongoose.Types.ObjectId(chatId);
    await User.updateOne(
      { _id: req.userId },
      { $pull: { pinnedContacts: objectChatId } }
    );
    res.status(200).send({ contactId: chatId, pinned: false });
  } catch (err) {
    console.log("Error unpinning contact - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function createNewContact(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).send({ message: "Invalid request" });
      return;
    }

    const objectId = new mongoose.Types.ObjectId(id);
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

export async function createNewGroup(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { name, selectedUsers } = req.body;
    const groupImage = req.file;
    if (
      !name ||
      !groupImage ||
      !selectedUsers ||
      JSON.parse(selectedUsers).length === 0
    ) {
      res.status(400).send({ message: "Invalid request" });
      return;
    }

    const participants = JSON.parse(selectedUsers).map((id: string) => {
      return new mongoose.Types.ObjectId(id);
    });

    const objectUserId = new mongoose.Types.ObjectId(req.userId);
    const user = await User.findById(objectUserId).select("firstName");
    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    // upload the image
    let image, publicId;
    const data = await uploadFile(res, groupImage, "groups", 400, 400);
    if (
      data &&
      typeof data === "object" &&
      "url" in data &&
      "publicId" in data
    ) {
      image = data.url;
      publicId = data.publicId;
    } else {
      res.status(500).send({ message: "Image upload failed" });
      return;
    }

    // create a new group
    const newGroupContact = await Contact.create({
      name,
      image,
      publicId,
      participants,
      admins: [objectUserId],
      isGroup: true,
      isActive: true,
    });

    const createdMessage = await Message.create({
      chatId: newGroupContact._id,
      sender: objectUserId,
      messageType: "announcement",
      summary: "created a new contact",
      announcer: user.firstName,
    });

    res.status(200).send({
      groupData: {
        _id: newGroupContact._id.toString(),
        contactName: newGroupContact.name,
        contactImage: newGroupContact.image,
        isGroup: newGroupContact.isGroup,
        isActive: newGroupContact.isActive,
        updatedAt: newGroupContact.updatedAt,
        lastMessages: [createdMessage],
      },
    });
  } catch (err) {
    console.log("Error creating new group - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function updateGroup(req: Request, res: Response): Promise<void> {
  try {
    const { chatId, name, socials } = req.body;
    if (!chatId || !name) {
      res.status(400).send({ message: "Invalid request" });
      return;
    }

    const group = await Contact.findById(chatId);
    if (!group) {
      res.status(404).send({ message: "Group not found" });
      return;
    }

    if (req.file) {
      // upload the image
      const data = await uploadFile(res, req.file, "avatar", 600, 600);
      if (
        data &&
        typeof data === "object" &&
        "url" in data &&
        "publicId" in data
      ) {
        if (group.publicId) {
          await deleteFile(res, group.publicId);
        }
        group.image = data.url;
        group.publicId = data.publicId;
      } else {
        res.status(500).send({ message: "Image upload failed" });
        return;
      }
    }

    const socialLinks = JSON.parse(socials) as { type: string; link: string }[];
    group.name = name;
    group.socialLinks = socialLinks.map((link) => {
      return {
        type: link.type,
        link: link.link,
      };
    });
    await group.save();

    const user = await User.findById(req.userId).select("firstName");
    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }

    const updatedMessage = await Message.create({
      chatId: group._id,
      sender: req.userId,
      messageType: "announcement",
      summary: "updated the group info",
      announcer: user.firstName,
    });

    res.status(200).send({
      updatedContact: {
        _id: group._id.toString(),
        name: group.name,
        image: group.image,
        socialLinks: group.socialLinks,
        updatedMessage: {
          content: updatedMessage.content,
          messageType: updatedMessage.messageType,
          seenBy: updatedMessage.seenBy,
          createdAt: updatedMessage.createdAt,
          summary: updatedMessage.summary,
          announcer: updatedMessage.announcer,
          sender: {
            _id: updatedMessage.sender.toString(),
          },
        },
      },
    });
  } catch (err) {
    console.log("Error updating group - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}
