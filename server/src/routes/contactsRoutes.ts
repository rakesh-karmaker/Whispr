import { searchContacts } from "../controllers/contactsController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import express from "express";

const contactsRouter = express.Router();

contactsRouter.get("/search-contacts", searchContacts);

export default contactsRouter;
