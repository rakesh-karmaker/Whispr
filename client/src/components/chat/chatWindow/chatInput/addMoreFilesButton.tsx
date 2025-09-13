import type React from "react";
import { GoPlus } from "react-icons/go";

export default function AddMoreFilesButton({
  setFiles,
}: {
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}): React.ReactNode {
  return (
    <li>
      <label
        htmlFor="add-more-file"
        className="cursor-pointer bg-white-2 dark:bg-d-light-dark-gray text-teal flex justify-center items-center min-w-10 max-w-10 w-10 aspect-square rounded-full hover:bg-teal hover:text-white transition-all duration-200"
        title="Add more files"
        aria-label="Add more files"
      >
        <GoPlus className="text-3xl" />
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
