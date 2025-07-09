export type RegisterDataType = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | FileList;
};

export type UserType = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  firstName: string;
  lastName: string;
  authProvider: string;
  pinnedContacts: string[];
};
