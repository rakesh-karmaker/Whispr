export type AddContactFunctionProps = {
  _id: string;
  contactName: string;
  isGroup: boolean;
  isActive: boolean;
  contactImage: string;
  updatedAt: string;
  lastMessages: {
    content: string;
    messageType: string;
    seenBy: string[];
    createdAt: string;
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
    createdAt: string;
    summary: string;
    announcer: string;
    sender: {
      _id: string;
    };
  };
};

export type MakeAdminFunctionProps = {
  makeAdmin: boolean;
  participantId: string;
  contactId: string;
};

export type RemoveParticipantFunctionProps = {
  participantId: string;
  contactId: string;
};

export type AddParticipantFunctionProps = {
  participants: {
    _id: string;
    name: string;
    avatar: string;
    isActive: boolean;
    firstName: string;
  }[];
  contactId: string;
};
