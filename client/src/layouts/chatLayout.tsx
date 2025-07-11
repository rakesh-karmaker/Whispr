import ChatLeft from "@/components/chat/chatLeft";
import type React from "react";
import { Outlet } from "react-router-dom";

export default function ChatLayout(): React.ReactNode {
  return (
    <div className="h-screen w-screen flex gap-4 p-4 bg-white-3">
      <ChatLeft />
      <Outlet />
    </div>
  );
}
