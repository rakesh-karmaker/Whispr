import Tooltip from "@mui/material/Tooltip";
import type React from "react";
import { FaFile } from "react-icons/fa";

export default function FilePreview({
  file,
  index,
  removeFile,
}: {
  file: File;
  index: number;
  removeFile: (index: number) => void;
}): React.ReactNode {
  const isImage = file.type.startsWith("image/");
  return (
    <li className="relative w-fit h-fit">
      {isImage ? (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="min-w-13 max-w-13 w-13 aspect-square object-cover rounded-lg"
        />
      ) : (
        <div className="w-35 h-13 flex gap-1 rounded-lg bg-white-2 dark:bg-d-light-dark-gray">
          <span className="min-w-8 max-w-8 h-full rounded-tl-lg rounded-bl-lg text-sm bg-gray-200  text-gray-500 dark:bg-d-dark-gray/20 flex justify-center items-center self-center">
            <FaFile />
          </span>
          <div
            className="text-[0.85rem] text-black-2 break-all dark:text-d-white/90 p-1"
            title={file.name}
          >
            <p className="line-clamp-2">{file.name}</p>
          </div>
        </div>
      )}
      <Tooltip title="Remove file" placement="top" arrow>
        <button
          type="button"
          className="min-w-4 max-w-4 min-h-4 max-h-4 aspect-square rounded-full absolute top-0 right-0 translate-x-[40%] -translate-y-[40%] bg-red text-pure-white flex items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-d-light-dark-gray hover:text-red transition-all duration-200"
          onClick={() => removeFile(index)}
          title="Remove file"
          aria-label="Remove file"
        >
          &times;
        </button>
      </Tooltip>
    </li>
  );
}
