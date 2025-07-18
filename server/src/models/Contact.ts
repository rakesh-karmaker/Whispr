import { ContactType } from "../types/modelType.js";
import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema<ContactType>(
  {
    name: { type: String },
    isGroup: { type: Boolean, default: false },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    image: { type: String },
    publicId: { type: String },
    isActive: { type: Boolean, default: true },
    socialLinks: [
      new mongoose.Schema(
        {
          type: { type: String, required: true },
          link: { type: String, required: true },
        },
        { _id: false }
      ),
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Contact", ContactSchema);
