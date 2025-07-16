import type { Option } from "@/components/ui/multiSelectDropdown";

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

export type CreateNewGroupMutationProps = {
  name: string;
  groupImage: FileList;
  selectedUsers: Option[];
};
