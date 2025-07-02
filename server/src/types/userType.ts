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
  imgId?: string | null;
  authProvider: "google" | "local" | "both";
  groupChats: mongoose.Types.ObjectId[];
  directMessages: mongoose.Types.ObjectId[];
}
