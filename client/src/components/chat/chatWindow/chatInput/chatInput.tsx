import type React from "react";
import FilePreview from "./filePreview";
import AddMoreFilesButton from "./addMoreFilesButton";
import { RiSendPlaneFill } from "react-icons/ri";
import { useState } from "react";

export default function ChatInputContainer({
  files,
  setFiles,
}: {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}): React.ReactNode {
  function removeFile(index: number): void {
    setFiles((prevFiles) => {
      const newFiles = [...prevFiles];
      newFiles.splice(index, 1);
      return newFiles;
    });
  }
  const [message, setMessage] = useState<string>("");

  function handleMessageSubmit() {
    // Handle message submission logic here
  }

  return (
    <div className="w-full bottom-0 max-w-[calc(100%-2rem)] flex flex-col gap-2 p-0.5 self-center">
      {files.length > 0 && (
        <ul className="overflow-x-auto overflow-y-visible flex items-center gap-2.5 pt-3 pb-3 list-none bg-pure-white rounded-xl max-h-28">
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
      <div className="w-full h-full flex items-end gap-2 mb-[1.375em]">
        <div className="w-full h-full rounded-full border-[0.5px] border-light-gray flex "></div>
        <button
          type="submit"
          aria-label="Send message"
          onClick={handleMessageSubmit}
          className="min-w-10.5 min-h-10.5 max-h-10.5 flex justify-center items-center cursor-pointer text-xl bg-teal text-pure-white hover:text-black hover:bg-white-2 transition-all duration-200 rounded-full focus-within:outline-none focus-within:bg-white-2 focus-within:text-black"
        >
          <RiSendPlaneFill className="-ml-0.5 -mb-0.25" />
        </button>
      </div>
    </div>
  );
}
