import { useUserStore } from "@/stores/useUserStore";
import type { UserType } from "@/types/authTypes";

export function useUser(): {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  isLoading: boolean;
} {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const isLoading = useUserStore((s) => s.isLoading);

  return { user, setUser, isLoading };
}
