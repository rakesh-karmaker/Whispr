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
    link: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface ContactType {
  _id: mongoose.Types.ObjectId;
  name: string;
  isGroup: boolean;
  participants: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  image: string;
  publicId: string | null;
  isActive: boolean;
  socialLinks: {
    type: string;
    link: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface MessageType {
  _id: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content?: string;
  messageType: "text" | "file" | "link" | "image" | "announcement" | "hybrid";
  files?: {
    url: string;
    publicId: string;
    size?: number;
  }[];
  link?: {
    url: string;
    imageURL?: string;
    title?: string;
    description?: string;
  };
  seenBy: mongoose.Types.ObjectId[];
  reactions: {
    userId: mongoose.Types.ObjectId;
    reaction: string;
  }[];
  summary?: string;
  announcer?: string;
  createdAt: Date;
  updatedAt: string;
}
