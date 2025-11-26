import app from "./app.js";
import config from "./config/config.js";
import mongoose from "mongoose";
import { verifyConnection } from "./config/mailSender.js";
import setUpSocket from "./lib/socket.js";
import https from "https";

// connect to mongoDB
mongoose
  .connect(config.mongoUrl)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// TODO: remove this when in a paid hosting
// keep the server awake on free hosting like render
if (!config.serverUrl.includes("localhost")) {
  setInterval(
    () => {
      const options = {
        hostname: config.serverUrl.replace(/^https?:\/\//, ""), // Remove protocol if present
        port: 443,
        path: "/",
        method: "GET",
        headers: {
          Origin: config.serverUrl,
        },
      };

      https.get(options).on("error", (e) => {
        console.error(`Got error: ${e.message}`);
      });
    },
    2 * 60 * 1000
  ); // every 2 minutes
}

// Verify email connection asynchronously (don't block server startup)
verifyConnection().catch((error) => {
  console.error("Email verification failed:", error.message);
  console.log("Server will continue without email functionality");
});

const server = app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

setUpSocket(server);
