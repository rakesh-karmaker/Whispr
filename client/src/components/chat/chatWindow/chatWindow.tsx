import type React from "react";
import ChatHeader from "./chatHeader";
import { useEffect, useState } from "react";
import ChatInputContainer from "./chatInput/chatInput";
import { usePreferences } from "@/hooks/usePreferences";
import FileDrag from "./fileDrag";
import MessagesContainer from "./messagesContainer";
import { useSelectedContact } from "@/hooks/useSelectContact";

export default function ChatWindow(): React.ReactNode {
  const { isSidebarOpen } = usePreferences();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);
  const { selectedContact } = useSelectedContact();

  useEffect(() => {
    setIsDragging(false);

    function handleDragOver(e: DragEvent) {
      if (Array.from(e.dataTransfer?.types || []).includes("Files")) {
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
      className={`flex-1 flex flex-col w-full h-full gap-4`}
      style={{
        maxWidth: isSidebarOpen
          ? `calc(100vw - (((25.75em + 2rem) * 2)))`
          : `calc(100vw - ((25.75em + 3rem)))`,
      }}
    >
      <ChatHeader />
      <div className="relative w-full h-full bg-pure-white flex-1 flex flex-col pt-0 rounded-xl">
        <MessagesContainer files={files} />
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
