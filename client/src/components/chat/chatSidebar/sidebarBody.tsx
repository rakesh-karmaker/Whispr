import type React from "react";
import ParticipantList from "./participantList";
import ChatInfo from "./chatInfo";
import ChatAssets from "./chatAssets/chatAssets";

export default function SidebarBody(): React.ReactNode {
  return (
    <div className="w-full h-full flex flex-col gap-7">
      <ChatInfo />
      <ParticipantList />
      <ChatAssets />
    </div>
  );
}
