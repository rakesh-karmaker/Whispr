const ImageKit = require("imagekit");
const sharp = require("sharp");
const { getDate } = require("../utils/getDate");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: "https://ik.imagekit.io" + process.env.IMAGEKIT_PUBLIC_KEY,
});

// Upload image to ImageKit and return the URL and image ID
const uploadImage = async (res, file, convertToWebp) => {
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
      mimeType: convertToWebp ? "image/webp" : file.mimetype,
    });

    const url = uploadedImage.url;

    return { url, imgId: uploadedImage.fileId };
  } catch (err) {
    console.log("Error uploading image - ", getDate(), "\n---\n", err);
    res
      .status(500)
      .send({ subject: "root", message: "Server error", error: err.message });
  }
};

// Upload multiple images to ImageKit and return the URLs and image IDs
const uploadMultipleImages = async (res, files, convertToWebp) => {
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
          mimeType: convertToWebp ? "image/webp" : file.mimetype,
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
      .send({ subject: "root", message: "Server error", error: err.message });
  }
};

const deleteImage = async (res, imageId) => {
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
