import type React from "react";
import { FaFile, FaPlus } from "react-icons/fa6";

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

function FilePreview({
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
        <div className="w-35 h-13 flex gap-1 rounded-lg bg-white-2 p-1">
          <span className="min-w-8 max-w-8 min-h-8 max-h-8 aspect-square rounded-full text-sm bg-light-teal border-[1px] border-teal/60 text-teal flex justify-center items-center self-center">
            <FaFile />
          </span>
          <div className="text-sm text-black-2 break-all" title={file.name}>
            <p>
              {file.name.length > 15
                ? `${file.name.slice(0, 15)}...`
                : file.name}
            </p>
          </div>
        </div>
      )}
      <button
        type="button"
        className="min-w-4 max-w-4 min-h-4 max-h-4 aspect-square rounded-full absolute top-0 right-0 translate-x-[40%] -translate-y-[40%] bg-red text-pure-white flex items-center justify-center text-md cursor-pointer hover:bg-white hover:text-red transition-all duration-200"
        onClick={() => removeFile(index)}
        title="Remove file"
        aria-label="Remove file"
      >
        &times;
      </button>
    </li>
  );
}

function AddMoreFilesButton({
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
