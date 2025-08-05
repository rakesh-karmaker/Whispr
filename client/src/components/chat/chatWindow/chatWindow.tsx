import type React from "react";
import ChatHeader from "./chatHeader";
import { useEffect, useState } from "react";
import ChatInputContainer from "./chatInput";
import { usePreferences } from "@/hooks/usePreferences";
import FileDrag from "./fileDrag";
import MessagesContainer from "./messagesContainer";

export default function ChatWindow(): React.ReactNode {
  const { isSidebarOpen } = usePreferences();
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    setIsDragging(false);

    window.addEventListener("dragover", (e) => {
      setIsDragging(true);
      e.preventDefault();
    });
    window.addEventListener("dragleave", () => setIsDragging(false));

    return () => {
      window.removeEventListener("dragover", (e) => {
        setIsDragging(true);
        e.preventDefault();
      });
      window.removeEventListener("dragleave", () => setIsDragging(false));
    };
  }, []);
  return (
    <div
      className={`flex-1 flex flex-col w-full ${
        isSidebarOpen
          ? "max-w-[calc(100svw_-_((25.75em_+_2rem)_*_2))]"
          : "max-w-[calc(100svw_-_((25.75em_+_3rem)))]"
      } h-full gap-4`}
    >
      <ChatHeader />
      <div className="relative w-full h-full bg-pure-white flex-1 flex flex-col pt-0 rounded-xl">
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
