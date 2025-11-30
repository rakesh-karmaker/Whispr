import type React from "react";
import { useState } from "react";
import FilePreview from "./filePreview";
import AddMoreFilesButton from "./addMoreFilesButton";
import { RiSendPlaneFill } from "react-icons/ri";
import Attachment from "./attachment";
import ChatInput from "./chatInput";
import EmojiPickerContainer from "./emojiPicker";
import { useContacts } from "@/hooks/useContacts";
import { useSocketStore } from "@/stores/useSocketStore";
import { useSelectedContact } from "@/hooks/useSelectContact";
import { uploadFiles } from "@/lib/api/messages";
import type { UploadedFile } from "@/types/messageTypes";

export default function ChatInputContainer({
  files,
  setFiles,
}: {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}): React.ReactNode {
  const { isMessageSending, setIsMessageSending } = useContacts();
  const socket = useSocketStore((s) => s.socket);
  const { selectedContact } = useSelectedContact();

  function removeFile(index: number): void {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
  }
  const [message, setMessage] = useState<string>("");

  async function handleMessageSubmit() {
    // Handle message submission logic here
    if ((files.length === 0 && message.trim() === "") || isMessageSending)
      return;

    setMessage("");
    setIsMessageSending(true);

    let imageData: UploadedFile[] = [];
    let fileData: UploadedFile[] = [];

    if (files.length > 0) {
      const res = await uploadFiles(files);
      if (res) {
        imageData = res.images;
        fileData = res.files;
        setFiles([]);
      }
    }

    if (socket) {
      socket.emit("sendMessage", {
        files: {
          images: imageData,
          files: fileData,
        },
        message,
        chatId: selectedContact._id,
      });
    }
  }

  return (
    <div className="w-full relative bottom-0 max-w-[calc(100%-2rem)] flex flex-col self-center">
      {files.length > 0 && (
        <ul className="overflow-y-show overflow-x-scroll min-h-20 flex items-center gap-2.5 list-none bg-pure-white dark:bg-d-dark-gray rounded-xl">
          <AddMoreFilesButton setFiles={setFiles} />
          {files.map((file, index) => (
            <FilePreview
              key={index}
              file={file}
              index={index}
              removeFile={removeFile}
            />
          ))}
        </ul>
      )}
      <div className="w-full h-full flex items-end gap-2 mb-[1.375em] max-mid:mb-3">
        <Attachment setFiles={setFiles} />
        <ChatInput
          message={message}
          setMessage={setMessage}
          handleMessageSubmit={handleMessageSubmit}
        />
        <EmojiPickerContainer setMessage={setMessage} />
        <button
          type="submit"
          aria-label="Send message"
          onClick={handleMessageSubmit}
          className="min-w-10.5 min-h-10.5 max-h-10.5 max-mid:min-w-9 max-mid:min-h-9 max-mid:max-h-9 flex justify-center items-center cursor-pointer text-xl bg-teal text-pure-white hover:text-black dark:hover:text-d-white/90 dark:hover:bg-light-dark-gray hover:bg-white-2 transition-all duration-200 rounded-full focus-within:outline-none focus-within:bg-white-2 focus-within:text-black disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-white-2 disabled:text-black"
          disabled={isMessageSending}
        >
          <RiSendPlaneFill className="-ml-0.5 -mb-0.25" />
        </button>
      </div>
    </div>
  );
}
