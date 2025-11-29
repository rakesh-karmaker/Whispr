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

  if (!isSidebarOpen && window.innerWidth >= 800) return null;

  return (
    <section
      className="w-full flex-1 h-full min-w-[25.75em] max-lg:min-w-[22rem] max-mid:min-w-0 max-w-[25.75em] max-xl:max-w-[calc(100vw-(22rem+3rem))] max-xl:absolute max-xl:z-999 max-xl:max-h-[calc(100svh-2rem)] overflow-y-auto rounded-xl bg-pure-white dark:bg-d-dark-gray p-[1.375em] flex flex-col gap-7 max-mid:absolute max-mid:z-99 max-mid:max-w-screen max-mid:left-screen max-mid:top-0 max-mid:max-h-screen max-mid:rounded-none transition-all duration-200 ease-in-out"
      style={{
        transform:
          window.innerWidth < 800
            ? `translateX(${isSidebarOpen ? 0 : 100}%)`
            : `translateX(0%)`,
      }}
    >
      <SidebarHeader />
      <SidebarBody />
    </section>
  );
}
