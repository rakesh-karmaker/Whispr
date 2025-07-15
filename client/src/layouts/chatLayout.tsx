import ChatLeft from "@/components/chat/chatLeft";
import { useContacts } from "@/hooks/useContacts";
import { useUser } from "@/hooks/useUser";
import { useSocketStore } from "@/stores/useSocketStore";
import type { QueriedContact } from "@/types/contactTypes";
import type React from "react";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function ChatLayout(): React.ReactNode {
  const { user } = useUser();

  // set up socket
  const connect = useSocketStore((s) => s.connect);
  const disconnect = useSocketStore((s) => s.disconnect);
  const socket = useSocketStore((s) => s.socket);
  const { setContacts } = useContacts();

  useEffect(() => {
    console.log("user.id", user?.id);
    if (user?.id) {
      connect(user.id);
    }
    return () => {
      disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    if (socket) {
      socket.on("add-contact", (contactData: QueriedContact) => {
        setContacts((prevContacts) => [contactData, ...prevContacts]);
      });
    }
  }, [socket]);

  return (
    <div className="h-screen flex gap-4 p-4 bg-white-3 chat-layout">
      <ChatLeft />
      <Outlet />
    </div>
  );
}
