import { UserType } from "@/types/modelType.js";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema<UserType>(
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
    pinnedContacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: ["User", "GroupChat"],
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
