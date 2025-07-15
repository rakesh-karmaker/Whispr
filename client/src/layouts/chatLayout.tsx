import ChatLeft from "@/components/chat/chatLeft";
import { useUser } from "@/hooks/useUser";
import { useSocketStore } from "@/stores/useSocketStore";
import type React from "react";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function ChatLayout(): React.ReactNode {
  const { user } = useUser();

  // set up socket
  const connect = useSocketStore((s) => s.connect);
  const disconnect = useSocketStore((s) => s.disconnect);

  useEffect(() => {
    console.log("user.id", user?.id);
    if (user?.id) {
      connect(user.id);
    }
    return () => {
      disconnect();
    };
  }, [user?.id]);

  return (
    <div className="h-screen flex gap-4 p-4 bg-white-3 chat-layout">
      <ChatLeft />
      <Outlet />
    </div>
  );
}
