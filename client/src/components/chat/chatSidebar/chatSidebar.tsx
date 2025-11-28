import type React from "react";
import SidebarHeader from "./sidebarHeader";
import { usePreferences } from "@/hooks/usePreferences";
import SidebarBody from "./sidebarBody";
import { useEffect } from "react";

export default function ChatSidebar(): React.ReactNode {
  const { isSidebarOpen, setIsSidebarOpen } = usePreferences();

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1536) {
        setIsSidebarOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isSidebarOpen) return null;

  return (
    <section className="w-full flex-1 h-full min-w-[25.75em] max-w-[25.75em] max-xl:max-w-[calc(100vw-(22rem+3rem))] max-xl:absolute max-xl:z-999 max-xl:max-h-[calc(100svh-2rem)] overflow-y-auto rounded-xl bg-pure-white dark:bg-d-dark-gray p-[1.375em] flex flex-col gap-7 max-mid:absolute max-mid:z-9 max-mid:max-w-[calc(100vw-1rem)] max-mid:left-2 max-mid:top-2 max-mid:max-h-[calc(100vh-1rem)]">
      <SidebarHeader />
      <SidebarBody />
    </section>
  );
}
