import ImageKit from "imagekit";
import sharp from "sharp";
import config from "../config/config.js";
import { Response } from "express";
import getDate from "../utils/getDate.js";

const imagekit = new ImageKit({
  publicKey: config.imagekitPublicKey,
  privateKey: config.imagekitPrivateKey,
  urlEndpoint: "https://ik.imagekit.io" + config.imagekitPublicKey,
});

// Upload image to ImageKit and return the URL and image ID
const uploadImage = async (
  res: Response,
  file: Express.Multer.File,
  convertToWebp?: boolean
) => {
  try {
    let resizedImageBuffer = file.buffer;
    if (convertToWebp) {
      resizedImageBuffer = await sharp(file.buffer)
        .webp({ quality: 80 }) // Convert to WebP format
        .toBuffer();
    }

    const uploadedImage = await imagekit.upload({
      file: resizedImageBuffer,
      fileName: `${Date.now()}-${file.originalname}`,
    });

    const url = uploadedImage.url;

    return { url, imgId: uploadedImage.fileId };
  } catch (err) {
    console.log("Error uploading image - ", getDate(), "\n---\n", err);
    res
      .status(500)
      .send({ subject: "root", message: "Server error", error: err });
  }
};

// Upload multiple images to ImageKit and return the URLs and image IDs
const uploadMultipleImages = async (
  res: Response,
  files: Express.Multer.File[],
  convertToWebp?: boolean
) => {
  try {
    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        let imageBuffer = file.buffer;
        if (convertToWebp) {
          imageBuffer = await sharp(file.buffer)
            .webp({ quality: 80 }) // Convert to WebP format
            .toBuffer();
        }

        const uploadedImage = await imagekit.upload({
          file: imageBuffer,
          fileName: `${Date.now()}-${file.originalname}-${Math.floor(
            Math.random() * 1000
          )}`,
        });

        return { url: uploadedImage.url, imgId: uploadedImage.fileId };
      })
    );

    const gallery = uploadedImages.map((image) => ({
      url: image.url,
      imgId: image.imgId,
    }));

    return gallery;
  } catch (err) {
    console.log("Error uploading images - ", getDate(), "\n---\n", err);
    res
      .status(500)
      .send({ subject: "root", message: "Server error", error: err });
  }
};

const deleteImage = async (res: Response, imageId: string) => {
  try {
    await imagekit.deleteFile(imageId, (err, result) => {
      if (err) {
        console.log("Error deleting image - ", getDate(), "\n---\n", err);
        return res.status(500).send({ error: "Failed to delete image." });
      }

      console.log("Image deleted successfully -", getDate(), "\n---\n");
    });
  } catch (err) {
    console.log("Error deleting image - ", getDate(), "\n---\n", err);
    return res.status(500).send({ error: "Failed to delete image." });
  }
};

module.exports = { uploadImage, uploadMultipleImages, deleteImage };
