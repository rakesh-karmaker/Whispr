import type React from "react";
import SidebarHeader from "./sidebarHeader";
import { usePreferences } from "@/hooks/usePreferences";
import SidebarBody from "./sidebarBody";

export default function ChatSidebar(): React.ReactNode {
  const { isSidebarOpen } = usePreferences();

  if (!isSidebarOpen) return null;

  return (
    <section className="w-full h-full max-w-[25.75em] overflow-y-auto rounded-xl bg-pure-white p-[1.375em] flex flex-col gap-7">
      <SidebarHeader />
      <SidebarBody />
    </section>
  );
}
