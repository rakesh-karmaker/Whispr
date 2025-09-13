import type React from "react";
import { GrAttachment } from "react-icons/gr";

export default function Attachment({
  setFiles,
}: {
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}) {
  return (
    <div>
      <label
        htmlFor="files"
        className="text-md text-gray cursor-pointer hover:text-black dark:hover:text-d-white/90 transition-all duration-200 min-w-10.5 min-h-10.5 max-h-10.5 flex justify-center items-center text-xl bg-white-2 dark:bg-d-light-dark-gray hover:bg-light-gray dark:hover:bg-d-dark-gray rounded-full focus-within:outline-none focus-within:bg-white-2 dark:focus-within:bg-d-dark-gray focus-within:text-black dark:focus-within:text-d-white/90"
      >
        <GrAttachment />
      </label>
      <input
        type="file"
        name="files"
        id="files"
        className="hidden"
        multiple
        aria-label="Upload files"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          const validFiles = files.filter((file) => {
            return (
              file.size <= 10 * 1024 * 1024 &&
              file.type &&
              !file.type.includes("folder")
            );
          });
          setFiles((prevFiles) => [...prevFiles, ...validFiles]);
        }}
      />
    </div>
  );
}
