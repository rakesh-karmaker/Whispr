import { create } from "zustand";

export type PreferencesStateType = {
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;

  isSidebarOpen: boolean;
  setIsSidebarOpen: (isSidebarOpen: boolean) => void;
};

export const usePreferencesStore = create<PreferencesStateType>((set) => ({
  theme: "light",
  setTheme: (theme) => set({ theme }),

  isSidebarOpen: true,
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
}));
