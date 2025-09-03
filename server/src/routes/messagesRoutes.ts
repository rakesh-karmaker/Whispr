import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getMessages, uploadFiles } from "../controllers/messagesController.js";
import upload from "../middlewares/multer.js";
const messagesRouter: express.Router = express.Router();

messagesRouter.get("/get-messages", verifyToken, getMessages);
messagesRouter.post(
  "/upload-files",
  verifyToken,
  upload.array("files"),
  uploadFiles
);

export default messagesRouter;
