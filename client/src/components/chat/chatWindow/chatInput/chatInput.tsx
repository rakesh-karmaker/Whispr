import type React from "react";
import FilePreview from "./filePreview";
import AddMoreFilesButton from "./addMoreFilesButton";

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

  return (
    <div className="w-full absolute bottom-0 bg-white-2 max-w-[calc(100%-2rem)] flex flex-col gap-2 p-0.5 self-center">
      {files.length > 0 && (
        <ul className="overflow-x-auto overflow-y-visible flex items-center gap-2.5 pt-3 pb-3 list-none">
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
    </div>
  );
}
