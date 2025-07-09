import mongoose from "mongoose";

export interface UserType {
  _id: mongoose.Types.ObjectId;
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
  pinnedContacts: mongoose.Types.ObjectId[];
  isActive: boolean;
  socialLinks: {
    type: string;
    url: string;
  }[];
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactType {
  _id: mongoose.Types.ObjectId;
  name: string;
  isGroup: boolean;
  participants: mongoose.Types.ObjectId[];
  admins?: mongoose.Types.ObjectId[];
  image: string;
  publicId: string | null;
  isActive: boolean;
  socialLinks: {
    type: string;
    url: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageType {
  _id: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content?: string;
  messageType: "text" | "file" | "link";
  files?: {
    url: string;
    publicId: string;
  }[];
  link?: {
    url: string;
    ogImageURL: string;
    ogTitle: string;
    ogDescription: string;
  };
  seenBy: mongoose.Types.ObjectId[];
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}
