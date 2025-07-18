export type AddContactFunctionProps = {
  _id: string;
  contactName: string;
  isGroup: boolean;
  isActive: boolean;
  contactImage: string;
  updatedAt: Date;
  lastMessages: {
    content: string;
    messageType: string;
    seenBy: string[];
    createdAt: Date;
    summary: string;
    announcer: string;
    sender: {
      _id: string;
    };
  }[];
};

export type UpdateGroupFunctionProps = {
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
