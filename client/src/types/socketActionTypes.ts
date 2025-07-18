export type UpdatedGroupData = {
  _id: string;
  name: string;
  image: string;
  socialLinks: { type: string; link: string }[];
  updatedMessage: {
    content: string;
    messageType: string;
    seenBy: string[];
    createdAt: Date;
    summary: string;
    announcer: string;
    sender: {
      _id: string;
    };
  };
};
