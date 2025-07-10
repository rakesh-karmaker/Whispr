import { getUser, login, register } from "../controllers/authController.js";
import {
  resetPassword,
  sendForgotPasswordOtp,
  verifyOtp,
} from "../controllers/forgotPasswordController.js";
import { addTempUser, getTempUser } from "../controllers/tempUserController.js";
import googleRouter from "../lib/oAuth/google.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";
import express from "express";
const authRouter: express.Router = express.Router();

authRouter.use("/google", googleRouter);

authRouter.get("/get-temp-user/:id", getTempUser);
authRouter.post("/add-temp-user", addTempUser);

authRouter.post("/register", upload.single("avatar"), register);
authRouter.post("/login", login);
authRouter.get("/get-user", verifyToken, getUser);

authRouter.post("/forgot-password", sendForgotPasswordOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);

export default authRouter;
