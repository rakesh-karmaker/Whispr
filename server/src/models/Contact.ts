import { ContactType } from "@/types/modelType.js";
import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema<ContactType>(
  {
    name: { type: String, required: true },
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Contact", ContactSchema);
