import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import config from "./config/config.js";
import contactsRouter from "./routes/contactsRoutes.js";

const app = express();

app.use(errorHandler);
// app.use(
//   cors({
//     origin: [config.clientUrl],
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//     credentials: true,
//   })
// );
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

app.use("/auth", authRouter);
app.use("/contact", contactsRouter);

export default app;
