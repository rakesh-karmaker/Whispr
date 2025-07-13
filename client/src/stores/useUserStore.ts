import { create } from "zustand";
import type { UserType } from "@/types/authTypes";

interface UserState {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
