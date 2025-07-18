import type { NewSelectedContact, SelectedContact } from "@/types/contactTypes";
import type { FileMessageType, LinkMessageType } from "@/types/messageTypes";
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

  images: FileMessageType[];
  setImages: (
    images: FileMessageType[] | ((prev: FileMessageType[]) => FileMessageType[])
  ) => void;

  files: FileMessageType[];
  setFiles: (
    files: FileMessageType[] | ((prev: FileMessageType[]) => FileMessageType[])
  ) => void;

  links: LinkMessageType[];
  setLinks: (
    links: LinkMessageType[] | ((prev: LinkMessageType[]) => LinkMessageType[])
  ) => void;
};

export const useSelectedContactStore = create<SelectedContactStateType>(
  (set) => ({
    selectedContact: {} as SelectedContact,
    setSelectedContact: (selectedContact) => set({ selectedContact }),

    isLoading: false,
    setIsLoading: (isLoading) => set({ isLoading }),

    isNewSelectedContact: false,
    setIsNewSelectedContact: (isNewSelectedContact) =>
      set({ isNewSelectedContact }),

    newSelectedContact: {} as NewSelectedContact,
    setNewSelectedContact: (newSelectedContact) => set({ newSelectedContact }),

    images: [],
    setImages: (imagesOrFn) =>
      set((state) => ({
        images:
          typeof imagesOrFn === "function"
            ? imagesOrFn(state.images)
            : imagesOrFn,
      })),

    files: [],
    setFiles: (filesOrFn) =>
      set((state) => ({
        files:
          typeof filesOrFn === "function" ? filesOrFn(state.files) : filesOrFn,
      })),

    links: [],
    setLinks: (linksOrFn) =>
      set((state) => ({
        links:
          typeof linksOrFn === "function" ? linksOrFn(state.links) : linksOrFn,
      })),
  })
);
