import cloudinary from "../config/cloudinary.js";
import { Response } from "express";
import getDate from "../utils/getDate.js";
import { Readable } from "stream";
import sharp from "sharp";

export async function uploadFile(
  res: Response,
  file: Express.Multer.File,
  folder: string,
  width?: number,
  height?: number
): Promise<{ url: string; publicId: string } | Response> {
  try {
    // change the width and height if an image
    if (file.mimetype.includes("image") && (width || height)) {
      const imageBuffer = await sharp(file.buffer)
        .resize({
          width: width || undefined,
          height: height || undefined,
          fit: "cover",
        })
        .webp({ quality: 80 })
        .toBuffer();
      file = { ...file, buffer: imageBuffer };
    }

    const uploadOptions: {
      folder: string;
      resource_type: "auto" | "image" | "video" | "raw" | undefined;
      public_id: string;
    } = {
      folder: `whispr/${folder}/`,
      resource_type: "auto", // auto detects image / video / raw
      public_id: `${Date.now()}-${file.originalname}`,
    };

    const streamUpload = (fileBuffer: Buffer) =>
      new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject("No result from Cloudinary");
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );

        Readable.from(fileBuffer).pipe(stream);
      });

    const result = await streamUpload(file.buffer);

    return { url: result.secure_url, publicId: result.public_id };
  } catch (err) {
    console.log("Error uploading file -", getDate(), "\n---\n", err);
    return res.status(500).send({ error: "Failed to upload file." });
  }
}

export async function uploadMultipleFiles(
  res: Response,
  files: Express.Multer.File[],
  folder: string,
  width?: number,
  height?: number
): Promise<{ url: string; publicId: string }[] | Response> {
  try {
    const streamUpload = async (file: Express.Multer.File) => {
      // change the width and height if an image
      if (file.mimetype.includes("image") && (width || height)) {
        const imageBuffer = await sharp(file.buffer)
          .resize({
            width: width || undefined,
            height: height || undefined,
            fit: "cover",
          })
          .webp({ quality: 80 })
          .toBuffer();
        file = { ...file, buffer: imageBuffer };
      }

      const uploadOptions: {
        folder: string;
        resource_type: "auto" | "image" | "video" | "raw" | undefined;
        public_id: string;
      } = {
        folder: `whispr/${folder}/`,
        resource_type: "auto", // auto detects image / video / raw
        public_id: `${Date.now()}-${file.originalname}-${Math.floor(Math.random() * 1000)}`,
      };

      return new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject("No result from Cloudinary");
            resolve({
              secure_url: result.secure_url,
              public_id: result.public_id,
            });
          }
        );

        Readable.from(file.buffer).pipe(stream);
      });
    };

    const uploadedFiles = await Promise.all(
      files.map((file) => streamUpload(file))
    );

    return uploadedFiles.map((file) => ({
      url: file.secure_url,
      publicId: file.public_id,
    }));
  } catch (err) {
    console.log("Error uploading multiple files -", getDate(), "\n---\n", err);
    return res.status(500).send({ error: "Failed to upload files." });
  }
}

export async function deleteFile(
  res: Response,
  publicId: string
): Promise<void | Response> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    });
    console.log("File deleted successfully -", getDate(), "\n---\n");
  } catch (err) {
    console.log("Error deleting file -", getDate(), "\n---\n", err);
    return res.status(500).send({ error: "Failed to delete file." });
  }
}
