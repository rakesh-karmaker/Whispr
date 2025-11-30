import mongoose from "mongoose";
import { URLType } from "../types/modelType.js";

const URLSchema = new mongoose.Schema<URLType>(
  {
    url: {
      type: String,
      unique: true,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<URLType>("URLList", URLSchema);
