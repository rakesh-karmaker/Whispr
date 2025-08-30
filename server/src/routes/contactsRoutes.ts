import {
  changeContactPinStatus,
  createNewContact,
  getAllContacts,
  getContact,
  getMessages,
  searchContacts,
} from "../controllers/contactsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import express from "express";
import upload from "../middlewares/multer.js";
import { getAssets } from "../controllers/contactAssetsController.js";
import { createNewGroup, updateGroup } from "../controllers/groupController.js";

const contactsRouter = express.Router();

contactsRouter.get("/search-contacts", verifyToken, searchContacts);
contactsRouter.get("/get-all-contacts", verifyToken, getAllContacts);
contactsRouter.get("/get-contact", verifyToken, getContact);
contactsRouter.get("/get-messages", getMessages);
contactsRouter.get("/get-assets", verifyToken, getAssets);

contactsRouter.post("/pin-contact", verifyToken, changeContactPinStatus);
contactsRouter.post("/unpin-contact", verifyToken, changeContactPinStatus);
contactsRouter.post("/create-new-contact", verifyToken, createNewContact);
contactsRouter.post(
  "/create-new-group",
  upload.single("groupImage"),
  verifyToken,
  createNewGroup
);

contactsRouter.patch(
  "/update-group",
  upload.single("groupImage"),
  verifyToken,
  updateGroup
);

export default contactsRouter;
