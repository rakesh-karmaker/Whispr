import type React from "react";
import ChatHeader from "./chatHeader";
import { useEffect, useState } from "react";
import ChatInputContainer from "./chatInput/chatInputContainer";
// import { usePreferences } from "@/hooks/usePreferences";
import FileDrag from "./fileDrag";
import MessagesContainer from "./messagesContainer";
import { useSelectedContact } from "@/hooks/useSelectContact";

export default function ChatWindow(): React.ReactNode {
  // const { isSidebarOpen, isChatOpen } = usePreferences();
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
      className={`flex-1 flex flex-col w-full max-w-full h-full gap-4 max-mid:gap-0 max-mid:min-w-[100svw] max-mid:min-h-[100svh] max-mid:max-w-[100svw] max-mid:max-h-[100svh] max-mid:rounded-none`}
      // style={{
      //   maxWidth: isSidebarOpen
      //     ? `calc(100svw - (((25.75em + 2rem) * 2)))`
      //     : `calc(100svw - ((25.75em + 3rem)))`,
      // }}
      // style={{
      //   display: isChatOpen || window.innerWidth > 800 ? "flex" : "none",
      // }}
    >
      <ChatHeader />
      <div className="relative w-full h-full bg-pure-white dark:bg-d-dark-gray flex-1 flex flex-col pt-0 rounded-xl max-mid:rounded-none gap-3">
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
