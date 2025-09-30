import cloudinary from "../config/cloudinary.js";
import getDate from "../utils/getDate.js";
import { Readable } from "stream";
import sharp from "sharp";
import generateId from "../utils/generateId.js";

export async function uploadFile(
  file: Express.Multer.File,
  folder: string,
  width?: number,
  height?: number
): Promise<{ url: string; publicId: string }> {
  try {
    if (
      !file ||
      !file.buffer ||
      file.size == 0 ||
      file.size > 10 * 1024 * 1024 // 10 MB limit
    ) {
      throw new Error("File is empty or too large.");
    }

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
      resource_type: file.mimetype.includes("pdf") ? "raw" : "auto",
      public_id: `${generateId()}-${file.originalname}`,
    };

    const streamUpload = (fileBuffer: Buffer) =>
      new Promise<{
        secure_url: string;
        public_id: string;
      }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            use_filename: true,
            unique_filename: true,
            ...uploadOptions,
          },
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
    throw new Error("Failed to upload file.");
  }
}

export async function uploadMultipleFiles(
  files: Express.Multer.File[],
  folder: string,
  width?: number,
  height?: number
): Promise<{ url: string; publicId: string }[]> {
  try {
    const streamUpload = async (file: Express.Multer.File) => {
      if (!file || !file.buffer || file.size === 0) {
        throw new Error("File is empty.");
      }
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
        resource_type: file.mimetype.includes("pdf") ? "raw" : "auto",
        public_id: `${generateId()}-${file.originalname}`,
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
    throw new Error("Failed to upload files.");
  }
}

export async function deleteFile(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    });
    console.log("File deleted successfully -", getDate(), "\n---\n");
  } catch (err) {
    console.log("Error deleting file -", getDate(), "\n---\n", err);
    throw new Error("Failed to delete file.");
  }
}
