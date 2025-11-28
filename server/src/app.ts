import express from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import config from "./config/config.js";
import contactsRouter from "./routes/contactsRoutes.js";
import messagesRouter from "./routes/messagesRoutes.js";
import assetsRouter from "./routes/assetsRoutes.js";
import compression from "compression";

const app = express();

app.use(errorHandler);
app.use(
  cors({
    origin: [config.clientUrl, config.serverUrl],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("public"));

// use compression middleware
app.use(
  compression({
    level: 6, // Compression level (1-9)
    threshold: 1024, // Minimum size in bytes to compress
  })
);

app.use("/auth", authRouter);
app.use("/contact", contactsRouter);
app.use("/messages", messagesRouter);
app.use("/assets", assetsRouter);

export default app;
