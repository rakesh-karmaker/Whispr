export type Announcement = {
  _id: string;
  content: string;
  messageType: string;
  seenBy: string[];
  updatedAt: string;
  summary: string;
  announcer: string;
  sender: {
    _id: string;
  };
};

export type UpdatedGroupData = {
  _id: string;
  name: string;
  image: string;
  updatedAt: string;
  socialLinks: { type: string; link: string }[];
  updatedMessage: Announcement;
};

export type MakeAdminFunctionProps = {
  makeAdmin: boolean;
  contactId: string;
  updatedAt: string;
  participantData: {
    _id: string;
    name: string;
    avatar: string;
  };
  announcement: Announcement;
};

export type RemoveParticipantFunctionProps = Omit<
  MakeAdminFunctionProps,
  "makeAdmin"
>;

export type AddParticipantFunctionProps = {
  participants: {
    _id: string;
    name: string;
    avatar: string;
    isActive: boolean;
    firstName: string;
  }[];
  updatedAt: string;
  contactId: string;
  announcement: Announcement;
};

export type MessageSeenFunctionProps = {
  messageId: string;
  chatId: string;
  seenBy: string;
};

export type MessageSawFunctionProps = {
  messageIds: string[];
  chatId: string;
};
