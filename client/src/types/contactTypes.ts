import type { Option } from "@/components/ui/multiSelectDropdown";
import type { UpdateGroupFormSchema } from "@/lib/zodSchemas/contactSchema";

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

export type SelectedContact = {
  _id: string;
  name: string;
  isGroup: boolean;
  image: string;
  socialLinks: { type: string; url: string }[];
  createdAt: Date;
  isActive: boolean;
  participantsCount: number;
  participants: {
    _id: string;
    name: string;
    avatar: string;
  }[];
  admins: {
    _id: string;
    name: string;
    avatar: string;
  }[];
};

export type NewSelectedContact = {
  _id: string;
  name: string;
  firstName: string;
  isActive: boolean;
  image: string;
};

export type CreateNewGroupMutationProps = {
  name: string;
  groupImage: FileList;
  selectedUsers: Option[];
};

export type UpdateGroupMutationProps = {
  name: string;
  groupImage?: string | FileList;
  socials: UpdateGroupFormSchema["socials"];
  chatId: string;
};
