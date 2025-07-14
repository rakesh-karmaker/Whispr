export type SearchedContact = {
  _id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  isActive: boolean;
};

export type QueriedContact = {
  _id: string;
  name: string;
  isGroup: boolean;
  isActive: boolean;
  image: string;
  updatedAt: Date;
  lastMessages: {
    content: string;
    messageType: string;
    seenBy: string[];
    createdAt: Date;
    summary: string;
    sender: {
      _id: string;
    };
  }[];
};
