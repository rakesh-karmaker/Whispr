import mongoose from "mongoose";

export interface IUser {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  salt?: string;
  googleId?: string;
  avatar: string;
  publicId?: string | null;
  authProvider: "google" | "local" | "both";
  pinnedContacts: {
    _id: mongoose.Types.ObjectId | null;
  }[];
}
