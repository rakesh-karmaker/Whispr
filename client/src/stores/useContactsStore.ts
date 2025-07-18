import type { QueriedContact } from "@/types/contactTypes";
import { create } from "zustand";

export type ContactsStateType = {
  contacts: QueriedContact[];
  setContacts: (
    contacts: QueriedContact[] | ((prev: QueriedContact[]) => QueriedContact[])
  ) => void;
  pinnedContacts: QueriedContact[];
  setPinnedContacts: (
    contacts: QueriedContact[] | ((prev: QueriedContact[]) => QueriedContact[])
  ) => void;
  changeActiveContact: (contactId: string, activeStatus: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

export const useContactsStore = create<ContactsStateType>((set) => ({
  contacts: [],
  setContacts: (contactsOrFn) =>
    set((state) => ({
      contacts:
        typeof contactsOrFn === "function"
          ? contactsOrFn(state.contacts)
          : contactsOrFn,
    })),
  pinnedContacts: [],
  setPinnedContacts: (contactsOrFn) =>
    set((state) => ({
      pinnedContacts:
        typeof contactsOrFn === "function"
          ? contactsOrFn(state.pinnedContacts)
          : contactsOrFn,
    })),
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
