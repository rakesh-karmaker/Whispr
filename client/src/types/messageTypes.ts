export type MessageType = {
  _id: string;
  chatId: string;
  senderDetails: {
    _id: string;
    name: string;
    avatar: string;
  };
  content?: string;
  messageType: "text" | "file" | "link" | "announcement" | "hybrid";
  files?: {
    url: string;
    publicId: string;
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

export type FileMessageType = {
  url: string;
  publicId: string;
  size: number;
};

export type LinkMessageType = {
  url: string;
  title: string;
  description: string;
  imageURL: string;
};
