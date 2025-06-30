import multer from "multer";
import path from "path";

const LIMIT: number = 5 * 1024 * 1024; // 5MB

// Configure storage (in memory for processing with Sharp)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  fileFilter: (req, file: Express.Multer.File, cb) => {
    const fileTypes: RegExp = /jpeg|jpg|png|webp/;

    const extname: boolean = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimeType: boolean = fileTypes.test(file.mimetype);

    if (extname && mimeType) {
      cb(null, true);
    } else {
      console.log(`Submitted IMAGE file type: ${file.mimetype}`);
      cb(new Error("Only images are allowed"));
    }
  },
  limits: {
    fileSize: LIMIT,
  },
});

module.exports = upload;
