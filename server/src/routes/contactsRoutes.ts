import {
  createNewContact,
  getAllContacts,
  searchContacts,
} from "../controllers/contactsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import express from "express";

const contactsRouter = express.Router();

contactsRouter.get("/search-contacts", verifyToken, searchContacts);
contactsRouter.get("/get-all-contacts", verifyToken, getAllContacts);

contactsRouter.post("/create-new-contact", verifyToken, createNewContact);

export default contactsRouter;
