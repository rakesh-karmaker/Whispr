import { IUser } from "@/types/userType.js";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    salt: { type: String },
    googleId: { type: String },
    avatar: { type: String },
    publicId: { type: String },
    authProvider: {
      type: String,
      enum: ["google", "local", "both"],
      default: "google",
    },
    // Store chat room memberships
    groupChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "GroupChat" }],
    directMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "DMRoom" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
