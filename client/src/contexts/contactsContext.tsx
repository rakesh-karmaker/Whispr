import { getAllContacts } from "@/lib/api/contacts";
import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect } from "react";

interface Contact {
  _id: string;
  name: string;
  isGroup: boolean;
  image: string;
  lastMessage: string;
  lastMessageTime: string;
  unSeenMessages: number;
  isActive: boolean;
}

type ContactsContextType = {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  changeActiveContact: (contactId: string, activeStatus: boolean) => void;
  isLoading: boolean;
};

const ContactsContext = createContext<ContactsContextType | null>(null);

export const ContactsProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode => {
  const [contacts, setContacts] = React.useState<Contact[]>([]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["contacts"],
    queryFn: getAllContacts,
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  if (isError) console.log(error);

  useEffect(() => {
    if (data) {
      setContacts(data);
    }
  }, [data]);

  const changeActiveContact = (contactId: string, activeStatus: boolean) => {
    if (contacts) {
      const newContacts = contacts.map((contact) => {
        if (contact._id === contactId) {
          return { ...contact, isActive: activeStatus };
        } else {
          return { ...contact, isActive: contact.isActive };
        }
      });
      setContacts(newContacts);
    }
  };

  return (
    <ContactsContext.Provider
      value={{ contacts, setContacts, changeActiveContact, isLoading }}
    >
      {children}
    </ContactsContext.Provider>
  );
};

export const useContacts = (): ContactsContextType => {
  const context = useContext(ContactsContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }

  return context as ContactsContextType;
};
