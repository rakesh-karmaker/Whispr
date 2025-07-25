export type MessageType = {
  _id: string;
  chatId: string;
  sender: string;
  content?: string;
  messageType: "text" | "file" | "link" | "announcement";
  files?: {
    url: string;
    publicId: string;
  }[];
  link?: {
    url: string;
    ogImageURL?: string;
    ogTitle?: string;
    ogDescription?: string;
  };
  seenBy: string[];
  summary?: string;
  announcer?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type FileMessageType = {
  url: string;
  publicId: string;
};

export type LinkMessageType = {
  url: string;
  ogImageURL: string;
  ogTitle: string;
  ogDescription: string;
};
