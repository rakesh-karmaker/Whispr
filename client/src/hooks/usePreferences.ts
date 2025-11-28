import { usePreferencesStore } from "@/stores/usePreferencesStore";

export const usePreferences = () => {
  const theme = usePreferencesStore((state) => state.theme);
  const setTheme = usePreferencesStore((state) => state.setTheme);
  const isSidebarOpen = usePreferencesStore((state) => state.isSidebarOpen);
  const setIsSidebarOpen = usePreferencesStore(
    (state) => state.setIsSidebarOpen
  );
  const isChatOpen = usePreferencesStore((state) => state.isChatOpen);
  const setIsChatOpen = usePreferencesStore((state) => state.setIsChatOpen);

  return {
    theme,
    setTheme,
    isSidebarOpen,
    setIsSidebarOpen,
    isChatOpen,
    setIsChatOpen,
  };
};
