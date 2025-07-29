import type { FileMessageType, LinkMessageType } from "@/types/messageTypes";
import { create } from "zustand";

export type ContactAssetsStateType = {
  images: FileMessageType[];
  setImages: (
    images: FileMessageType[] | ((prev: FileMessageType[]) => FileMessageType[])
  ) => void;
  imagePage: number;
  setImagePage: (imagePage: number) => void;
  hasMoreImages: boolean;
  setHasMoreImages: (hasMoreImages: boolean) => void;
  imagesCount: number;
  setImagesCount: (imagesCount: number) => void;

  files: FileMessageType[];
  setFiles: (
    files: FileMessageType[] | ((prev: FileMessageType[]) => FileMessageType[])
  ) => void;
  filePage: number;
  setFilePage: (filePage: number) => void;
  hasMoreFiles: boolean;
  setHasMoreFiles: (hasMoreFiles: boolean) => void;
  filesCount: number;
  setFilesCount: (filesCount: number) => void;

  links: LinkMessageType[];
  setLinks: (
    links: LinkMessageType[] | ((prev: LinkMessageType[]) => LinkMessageType[])
  ) => void;
  linkPage: number;
  setLinkPage: (linkPage: number) => void;
  hasMoreLinks: boolean;
  setHasMoreLinks: (hasMoreLinks: boolean) => void;
  linksCount: number;
  setLinksCount: (linksCount: number) => void;

  reset: () => void;
};

export const useContactAssetsStore = create<ContactAssetsStateType>((set) => ({
  images: [],
  setImages: (imagesOrFn) =>
    set((state) => ({
      images:
        typeof imagesOrFn === "function"
          ? imagesOrFn(state.images)
          : imagesOrFn,
    })),
  imagePage: 1,
  setImagePage: (imagePage) => set({ imagePage }),
  hasMoreImages: true,
  setHasMoreImages: (hasMoreImages) => set({ hasMoreImages }),
  imagesCount: 0,
  setImagesCount: (imagesCount) => set({ imagesCount }),

  files: [],
  setFiles: (filesOrFn) =>
    set((state) => ({
      files:
        typeof filesOrFn === "function" ? filesOrFn(state.files) : filesOrFn,
    })),
  filePage: 1,
  setFilePage: (filePage) => set({ filePage }),
  hasMoreFiles: true,
  setHasMoreFiles: (hasMoreFiles) => set({ hasMoreFiles }),
  filesCount: 0,
  setFilesCount: (filesCount) => set({ filesCount }),

  links: [],
  setLinks: (linksOrFn) =>
    set((state) => ({
      links:
        typeof linksOrFn === "function" ? linksOrFn(state.links) : linksOrFn,
    })),
  linkPage: 1,
  setLinkPage: (linkPage) => set({ linkPage }),
  hasMoreLinks: true,
  setHasMoreLinks: (hasMoreLinks) => set({ hasMoreLinks }),
  linksCount: 0,
  setLinksCount: (linksCount) => set({ linksCount }),

  reset: () => {
    set({ images: [], imagePage: 1, hasMoreImages: true, imagesCount: 0 });
    set({ files: [], filePage: 1, hasMoreFiles: true, filesCount: 0 });
    set({ links: [], linkPage: 1, hasMoreLinks: true, linksCount: 0 });
  },
}));
