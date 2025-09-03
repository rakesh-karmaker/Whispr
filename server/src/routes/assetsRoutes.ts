import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getAssets } from "../controllers/assetsController.js";
const assetsRouter: express.Router = express.Router();

assetsRouter.get("/get-assets", verifyToken, getAssets);

export default assetsRouter;
