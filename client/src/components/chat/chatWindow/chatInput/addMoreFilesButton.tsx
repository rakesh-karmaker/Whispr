import type React from "react";
import { FaPlus } from "react-icons/fa";

export default function AddMoreFilesButton({
  setFiles,
}: {
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}): React.ReactNode {
  return (
    <li>
      <label
        htmlFor="add-more-file"
        className="cursor-pointer bg-white-2 text-teal text-xl flex justify-center items-center min-w-10 max-w-10 w-10 aspect-square rounded-full hover:bg-teal hover:text-white transition-all duration-200"
        title="Add more files"
        aria-label="Add more files"
      >
        <FaPlus />
      </label>
      <input
        type="file"
        id="add-more-file"
        className="hidden"
        multiple
        onChange={(e) => {
          if (e.target.files) {
            setFiles((prevFiles) => [
              ...prevFiles,
              ...Array.from(e.target.files ?? []),
            ]);
          }
        }}
      />
    </li>
  );
}
