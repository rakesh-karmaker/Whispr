export type FileMessageType = {
  url: string;
  publicId: string;
  size: number;
};

export type ImageMessageType = Omit<FileMessageType, "size">;

export type LinkMessageType = {
  messageId: string;
  url: string;
  title: string;
  description: string;
  imageURL: string;
};

export type UploadedFile = {
  url: string;
  publicId: string;
  size: number;
};

export type MessageType = {
  _id: string;
  chatId: string;
  senderDetails: {
    _id: string;
    name: string;
    avatar: string;
  };
  content?: string;
  messageType: "text" | "file" | "image" | "link" | "announcement" | "hybrid";
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
  seenBy: string[];
  summary?: string;
  announcer?: string;
  reactions?: {
    userId: string;
    reaction: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
};
