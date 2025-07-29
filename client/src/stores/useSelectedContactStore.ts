import type { NewSelectedContact, SelectedContact } from "@/types/contactTypes";
import { create } from "zustand";

export type SelectedContactStateType = {
  selectedContact: SelectedContact;
  setSelectedContact: (selectedContact: SelectedContact) => void;

  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;

  isNewSelectedContact: boolean;
  setIsNewSelectedContact: (isNewSelectedContact: boolean) => void;

  newSelectedContact: NewSelectedContact;
  setNewSelectedContact: (newSelectedContact: NewSelectedContact) => void;
};

export const useSelectedContactStore = create<SelectedContactStateType>(
  (set) => ({
    selectedContact: {} as SelectedContact,
    setSelectedContact: (selectedContact) => {
      const participantCount =
        selectedContact.admins && selectedContact.admins.length > 0
          ? selectedContact.admins.length + selectedContact.participants.length
          : selectedContact.participants.length;
      set({
        selectedContact: {
          ...selectedContact,
          participantCount,
        },
      });
    },
    isLoading: false,
    setIsLoading: (isLoading) => set({ isLoading }),

    isNewSelectedContact: false,
    setIsNewSelectedContact: (isNewSelectedContact) =>
      set({ isNewSelectedContact }),

    newSelectedContact: {} as NewSelectedContact,
    setNewSelectedContact: (newSelectedContact) => set({ newSelectedContact }),
  })
);
