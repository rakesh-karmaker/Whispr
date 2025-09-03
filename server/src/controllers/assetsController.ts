import { Request, Response } from "express";
import Message from "../models/Message.js";
import mongoose from "mongoose";
import addImageMetaTag from "../utils/addImageMetaTag.js";
import getDate from "../utils/getDate.js";
import {
  FileMessageType,
  ImageMessageType,
  LinkMessageType,
} from "../types/messageTypes.js";

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
      messageType: {
        $in: ["hybrid", assetType],
      },
    })
      .sort({ updatedAt: -1 })
      .select("files messageType link")
      .lean();

    // paginate manually
    const startIndex = (page - 1) * 10;
    const endIndex = startIndex + 10;
    const paginatedMessages = messages.slice(startIndex, endIndex);

    const hasMore = paginatedMessages.length > 0;
    const filteredMessages = await addImageMetaTag(paginatedMessages);

    // filter the assets by type
    const files: FileMessageType[] = [];
    const images: ImageMessageType[] = [];
    const links: LinkMessageType[] = [];

    filteredMessages.forEach((message) => {
      if (message.messageType === "file") {
        message.files &&
          message.files.forEach((file) => {
            files.push({
              url: file.url,
              publicId: file.publicId,
              size: file.size ?? 0,
            });
          });
      } else if (message.messageType === "image") {
        message.files &&
          message.files.forEach((file) => {
            images.push({
              url: file.url,
              publicId: file.publicId,
            });
          });
      } else if (message.messageType === "link") {
        message.link &&
          links.push({
            messageId: message._id.toString(),
            url: message.link.url,
            title: message.link.title ?? "",
            description: message.link.description ?? "",
            imageURL: message.link.imageURL ?? "",
          });
      }

      if (message.messageType === "hybrid") {
        message.files &&
          message.files.forEach((file) => {
            if (file.publicId.startsWith("whispr/images/")) {
              images.push({
                url: file.url,
                publicId: file.publicId,
              });
            } else if (file.publicId.startsWith("whispr/files/")) {
              files.push({
                url: file.url,
                publicId: file.publicId,
                size: file.size ?? 0,
              });
            }
          });

        message.link &&
          links.push({
            messageId: message._id.toString(),
            url: message.link.url,
            title: message.link.title ?? "",
            description: message.link.description ?? "",
            imageURL: message.link.imageURL ?? "",
          });
      }
    });

    res.status(200).send({
      assets:
        assetType === "link" ? links : assetType === "image" ? images : files,
      hasMore,
    });
  } catch (err) {
    console.log("Error getting assets - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}
