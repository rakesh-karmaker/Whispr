import { Request, Response } from "express";
import Message from "../models/Message.js";
import mongoose from "mongoose";
import addImageMetaTag from "../utils/addImageMetaTag.js";
import getDate from "../utils/getDate.js";

export async function getAssets(req: Request, res: Response): Promise<void> {
  try {
    const { assetType, chatId } = req.query;
    const page = parseInt(req.query.pageNumber as string, 10);
    if (!assetType || isNaN(page) || page < 1 || !chatId) {
      res.status(400).send({ message: "Invalid request" });
      return;
    }

    //! This loads all messages, consider optimizing
    const messages = await Message.find({
      chatId: new mongoose.Types.ObjectId(chatId.toString()),
      messageType: { $in: ["hybrid", assetType] },
    })
      .sort({ updatedAt: -1 })
      .select("files messageType link");

    // paginate manually
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    const paginatedMessages = messages.slice(startIndex, endIndex);

    const hasMore = paginatedMessages.length > 0;
    const filteredMessages = await addImageMetaTag(paginatedMessages);

    res.status(200).send({
      assets:
        assetType === "link"
          ? [
              ...filteredMessages.map((link) => {
                return { ...link.link };
              }),
            ]
          : filteredMessages.map((asset) => {
              return {
                files: asset.files,
                link: asset.link,
              };
            }),
      hasMore,
    });
  } catch (err) {
    console.log("Error getting assets - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}
