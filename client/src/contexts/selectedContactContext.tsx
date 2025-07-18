import { createContext, useContext, useState } from "react";

interface User {
  _id: string;
  name: string;
  avatar: string;
  isActive: boolean;
}

interface Contact {
  _id: string;
  name: string;
  isGroup: boolean;
  participants: User[];
  admins: User[];
  image: string;
  isActive: boolean;
  socialLinks: { type: string; link: string }[];
  createdAt: Date;
}

type SelectedContactContextType = {
  contactData: Contact | null;
  setContactData: React.Dispatch<React.SetStateAction<Contact | null>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const SelectedContactContext = createContext<SelectedContactContextType | null>(
  null
);

export function SelectedContactProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [contactData, setContactData] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <SelectedContactContext.Provider
      value={{ contactData, setContactData, isLoading, setIsLoading }}
    >
      {children}
    </SelectedContactContext.Provider>
  );
}

export const useSelectedContact = (): SelectedContactContextType => {
  const context = useContext(SelectedContactContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }

  return context as SelectedContactContextType;
};
