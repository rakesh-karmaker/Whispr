import type React from "react";
import ChatHeader from "./chatHeader";

export default function ChatWindow(): React.ReactNode {
  return (
    <div className="flex-1 flex flex-col w-full h-full gap-4">
      <ChatHeader />
      <div className="flex-1 w-full h-full"></div>
    </div>
  );
}
