import app from "./app.js";
import config from "./config/config.js";
import mongoose from "mongoose";
import type {} from "mongoose";

mongoose
  .connect(config.mongoUrl)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
