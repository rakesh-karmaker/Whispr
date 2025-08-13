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
