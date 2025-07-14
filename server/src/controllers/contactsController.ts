import Contact from "../models/Contact.js";
import User from "../models/User.js";
import getDate from "../utils/getDate.js";
import { Request, Response } from "express";

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
    const pageNumber = req.query.pageNumber;
    if (!pageNumber) {
      res.status(400).send({ message: "Please provide a page number" });
      return;
    }

    // get pinned contacts' ids
    const user = await User.findById(userId).select("pinnedContacts").lean();
    if (!user) {
      res.status(404).send({ message: "User not found" });
      return;
    }
    const pinnedContactIds = user.pinnedContacts || [];
    let pinnedContactsWithMessages = [];

    if ((pageNumber as unknown as number) === 1) {
      // get pinned contacts
      pinnedContactsWithMessages = await Contact.aggregate([
        {
          $match: {
            _id: { $in: pinnedContactIds },
          },
        },
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
                  localField: "senderId",
                  foreignField: "_id",
                  as: "senderDetails",
                },
              },
              { $unwind: "$senderDetails" },
              {
                $project: {
                  content: 1,
                  messageType: 1,
                  seenBy: 1,
                  summary: 1,
                  createdAt: 1,
                  sender: {
                    _id: "$senderDetails._id",
                  },
                },
              },
            ],
            as: "lastMessages",
          },
        },
        {
          $project: {
            isGroup: 1,
            isActive: 1,
            lastMessages: 1,
          },
        },
      ]);
    }

    // get all contacts except pinned contacts
    const allContacts = await Contact.aggregate([
      {
        $match: {
          $and: [
            { $or: [{ participants: userId }, { admins: userId }] },
            { _id: { $nin: pinnedContactIds } },
          ],
        },
      },
      {
        $lookup: {
          from: "messages",
          let: { chatId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$chatId", "$$chatId"] } } },
            { $sort: { createdAt: -1 } },
            { $limit: 10, $skip: ((pageNumber as unknown as number) - 1) * 10 },
            {
              $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "senderDetails",
              },
            },
            { $unwind: "$senderDetails" },
            {
              $project: {
                content: 1,
                messageType: 1,
                files: 1,
                link: 1,
                seenBy: 1,
                summary: 1,
                createdAt: 1,
                sender: {
                  _id: "$senderDetails._id",
                },
              },
            },
          ],
          as: "lastMessages",
        },
      },
      {
        $project: {
          isActive: 1,
          isGroup: 1,
          lastMessages: 1,
        },
      },
    ]);

    res.status(200).send({
      pinnedContacts: pinnedContactsWithMessages,
      contacts: allContacts,
    });
  } catch (err) {
    console.log("Error getting all contacts - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}
