import { MessageType } from "../types/modelType.js";
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema<MessageType>(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: { type: String },
    messageType: {
      type: String,
      enum: ["text", "file", "link", "announcement"],
      default: "text",
    },
    files: [
      {
        url: String,
        publicId: String,
      },
    ],
    link: {
      url: String,
    },
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    summary: {
      type: String,
    },
    announcer: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Message", MessageSchema);
