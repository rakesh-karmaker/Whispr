import app from "@/app.js";
import config from "@/config/config.js";
import mongoose from "mongoose";
import mailSender from "@/config/mailSender.js";

mongoose
  .connect(config.mongoUrl)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Test the mailSender
mailSender.verify((error, success) => {
  if (error) {
    console.log(error, "email");
  } else {
    console.log("Server is ready to send our emails");
  }
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
