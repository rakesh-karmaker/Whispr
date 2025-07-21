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
        default: [],
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
    createdAt: {
      type: String,
      set: (v = new Date()) => new Date(v).toISOString(),
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

ContactSchema.pre("save", function (next) {
  this.updatedAt = new Date().toISOString();
  next();
});

export default mongoose.model("Contact", ContactSchema);
