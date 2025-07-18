import type React from "react";
import SidebarHeader from "./sidebarHeader";
import { usePreferences } from "@/hooks/usePreferences";

export default function ChatSidebar(): React.ReactNode {
  const { isSidebarOpen } = usePreferences();

  if (!isSidebarOpen) return null;

  return (
    <div className="w-full h-full max-w-[27.75em] rounded-xl bg-pure-white p-4 flex flex-col gap-[71px]">
      <SidebarHeader />
    </div>
  );
}
