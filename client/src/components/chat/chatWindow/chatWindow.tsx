import type React from "react";
import ChatHeader from "./chatHeader";
import { useEffect, useState } from "react";
import ChatInputContainer from "./chatInput/chatInputContainer";
import { usePreferences } from "@/hooks/usePreferences";
import FileDrag from "./fileDrag";
import MessagesContainer from "./messagesContainer";
import { useSelectedContact } from "@/hooks/useSelectContact";

export default function ChatWindow(): React.ReactNode {
  const { isSidebarOpen, isChatOpen } = usePreferences();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const { selectedContact } = useSelectedContact();

  useEffect(() => {
    setIsDragging(false);

    function handleDragOver(e: DragEvent) {
      const types = Array.from(e.dataTransfer?.types || []);
      if (types.includes("Files") || types.includes("text/uri-list")) {
        setIsDragging(true);
        e.preventDefault();
      }
    }
    function handleDrop() {
      setIsDragging(false);
    }
    function handleDragEnd() {
      setIsDragging(false);
    }

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragend", handleDragEnd);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragend", handleDragEnd);
    };
  }, []);
  return (
    <div
      key={selectedContact?._id}
      className={`flex-1 flex flex-col w-full max-w-full h-full gap-4 max-mid:gap-2 max-mid:absolute max-mid:z-9 max-mid:max-w-[calc(100vw-1rem)] max-mid:left-2 max-mid:top-2 max-mid:max-h-[calc(100vh-1rem)]`}
      // style={{
      //   maxWidth: isSidebarOpen
      //     ? `calc(100vw - (((25.75em + 2rem) * 2)))`
      //     : `calc(100vw - ((25.75em + 3rem)))`,
      // }}
      style={{
        display: isChatOpen || window.innerWidth > 768 ? "flex" : "none",
      }}
    >
      <ChatHeader />
      <div className="relative w-full h-full bg-pure-white dark:bg-d-dark-gray flex-1 flex flex-col pt-0 rounded-xl gap-3">
        <MessagesContainer />
        <ChatInputContainer files={files} setFiles={setFiles} />
        <FileDrag
          isDragging={isDragging}
          setFiles={setFiles}
          setIsDragging={setIsDragging}
        />
      </div>
    </div>
  );
}
