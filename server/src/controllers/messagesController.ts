import { Request, Response } from "express";
import mongoose from "mongoose";
import { getMessagesQuery } from "../queries/contactQueries.js";
import addMetaTag from "../utils/addImageMetaTag.js";
import getDate from "../utils/getDate.js";
import { uploadMultipleFiles } from "../lib/upload.js";
import { UploadedFile } from "../types/messageTypes.js";

export async function getMessages(req: Request, res: Response): Promise<void> {
  try {
    const { chatId, pageNumber } = req.query;
    if (!chatId || !pageNumber) {
      res.status(400).send({ message: "Invalid request" });
      return;
    }
    const objectChatId = new mongoose.Types.ObjectId(chatId as string);
    const messages = await getMessagesQuery(
      objectChatId,
      pageNumber as unknown as number
    );

    const messagesWithMetaData = await addMetaTag(messages);
    const hasMore = messages.length > 0;

    res.status(200).send({
      messages: messagesWithMetaData,
      hasMore,
    });
  } catch (err) {
    console.log("Error getting messages - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}

export async function uploadFiles(req: Request, res: Response): Promise<void> {
  try {
    const allFiles = req.files as Express.Multer.File[];
    if (!allFiles || allFiles.length === 0) {
      res.status(400).send({ message: "No files uploaded" });
      return;
    }

    // Filter images and files
    const images = allFiles.filter((file) =>
      file.mimetype.startsWith("image/")
    );
    const files = allFiles.filter(
      (file) => !file.mimetype.startsWith("image/")
    );

    const imageData: UploadedFile[] = [];
    const fileData: UploadedFile[] = [];

    console.log(files, images);

    // upload images
    if (images.length > 0) {
      try {
        const imageResponses = await uploadMultipleFiles(images, "images");

        if (Array.isArray(imageResponses)) {
          imageResponses.forEach((image, index) => {
            imageData.push({
              url: image?.url || "",
              publicId: image?.publicId || "",
              size: images[index].size,
            });
          });
        }
      } catch (error) {
        console.log("Error uploading images:", error);
        res.status(500).send({ message: "Failed to upload images" });
        return;
      }
    }

    // upload files
    if (files.length > 0) {
      try {
        const fileResponses = await uploadMultipleFiles(files, "files");

        if (Array.isArray(fileResponses)) {
          fileResponses.forEach((file, index) => {
            fileData.push({
              url: file?.url || "",
              publicId: file?.publicId || "",
              size: files[index].size,
            });
          });
        }
      } catch (error) {
        console.log("Error uploading files:", error);
        res.status(500).send({ message: "Failed to upload files" });
        return;
      }
    }

    res.status(200).send({ images: imageData, files: fileData });
  } catch (err) {
    console.log("Error uploading files - ", getDate(), "\n---\n", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    res.status(500).send({ message: "Server error", error: errorMessage });
  }
}
