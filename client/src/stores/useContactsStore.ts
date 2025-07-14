import type { QueriedContact } from "@/types/contactTypes";
import { create } from "zustand";

export type ContactsStateType = {
  contacts: QueriedContact[];
  setContacts: (contacts: QueriedContact[]) => void;
  pinnedContacts: QueriedContact[];
  setPinnedContacts: (contacts: QueriedContact[]) => void;
  changeActiveContact: (contactId: string, activeStatus: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

export const useContactsStore = create<ContactsStateType>((set) => ({
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  pinnedContacts: [],
  setPinnedContacts: (contacts) => set({ pinnedContacts: contacts }),
  changeActiveContact: (contactId, activeStatus) =>
    set((state) => ({
      contacts: state.contacts.map((contact) => ({
        ...contact,
        isActive: contact._id === contactId ? activeStatus : contact.isActive,
      })),
      pinnedContacts: state.pinnedContacts.map((contact) => ({
        ...contact,
        isActive: contact._id === contactId ? activeStatus : contact.isActive,
      })),
    })),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
}));
