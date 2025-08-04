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
      enum: ["text", "file", "link", "image", "announcement", "hybrid"],
      default: "text",
    },
    files: [
      {
        url: { type: String },
        publicId: { type: String },
        size: { type: Number, default: 0 },
      },
    ],
    link: {
      url: { type: String },
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
    updatedAt: {
      type: String,
      set: (v = new Date()) => new Date(v).toISOString(),
    },
    createdAt: {
      type: Date,
      default: Date.now,
      set: (v = new Date()) => new Date(v),
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

MessageSchema.pre("save", function (next) {
  this.updatedAt = new Date().toISOString();
  next();
});

export default mongoose.model("Message", MessageSchema);
