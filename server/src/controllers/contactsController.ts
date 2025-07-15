import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import User from "../models/User.js";
import getDate from "../utils/getDate.js";
import { Request, Response } from "express";
import Message from "../models/Message.js";

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
            isActive: 1,
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
          $or: [{ participants: objectUserId }, { admins: objectUserId }],
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
            { $skip: (page - 1) * 10 },
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
          isActive: 1,
          updatedAt: 1,
          contactName: 1,
          contactImage: 1,
          lastMessages: 1,
        },
      },
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
