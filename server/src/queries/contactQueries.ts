import mongoose from "mongoose";
import Contact from "../models/Contact.js";

export async function getAllContactsQuery(
  objectUserId: mongoose.Types.ObjectId,
  matchCondition: mongoose.FilterQuery<typeof Contact>,
  limit: number = 10,
  pageNumber: number = 1
) {
  const allContacts = await Contact.aggregate([
    { $match: matchCondition },
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
              updatedAt: 1,
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
    { $skip: (pageNumber - 1) * limit },
    { $limit: limit === 0 ? 9999999 : limit },
    { $sort: { updatedAt: -1 } },
  ]);

  return allContacts;
}

export async function getContactQuery(objectChatId: mongoose.Types.ObjectId) {
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
          // { $limit: 4 }, //TODO: add pagination for participants to reduce load
          { $project: { _id: 1, name: 1, avatar: 1 } },
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
        pipeline: [{ $project: { _id: 1, name: 1, avatar: 1 } }],
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
          {
            $project: {
              content: 1,
              messageType: 1,
              updatedAt: 1,
              seenBy: 1,
              summary: 1,
              announcer: 1,
              announcement: 1,
            },
          },
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

  return contact;
}
