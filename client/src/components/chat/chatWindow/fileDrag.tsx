import type React from "react";
import { RiFolderUploadFill } from "react-icons/ri";

export default function FileDrag({
  isDragging,
  setFiles,
  setIsDragging,
}: {
  isDragging: boolean;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
}): React.ReactNode {
  function handleDrop(event: React.DragEvent<HTMLDivElement>): void {
    event.preventDefault();
    // only take the files from the drop event
    if (event.dataTransfer.files.length === 0) return;
    const droppedFiles = Array.from(event.dataTransfer.files);
    // remove folders and files larger than 10MB
    const validFiles = droppedFiles.filter((file) => {
      return (
        file.size <= 10 * 1024 * 1024 &&
        file.type &&
        !file.type.includes("folder")
      );
    });
    if (validFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...validFiles]);
    }
    setIsDragging(false);
  }

  return (
    <div
      className={`w-full h-full absolute top-0 left-0 flex justify-center items-center border-dashed border-2 border-teal rounded-lg bg-white-3/40 backdrop-blur-xs ${
        isDragging ? "opacity-100" : "opacity-0 pointer-events-none"
      } transition-opacity duration-300`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="flex flex-col gap-4 items-center">
        <p
          className={`p-6 max-w-fit aspect-square rounded-full text-pure-white bg-teal text-5xl flex justify-center items-center ${
            isDragging ? "scale-100 opacity-100" : "scale-0 opacity-0"
          } transition-all duration-300 delay-150 ease-in-out`}
        >
          <RiFolderUploadFill />
        </p>
        <div className="flex flex-col gap-2 items-center">
          <h3 className={`text-2xl text-center font-medium`}>
            Upload your files
          </h3>
          <p className="text-sm text-center">
            Max <span className="font-medium">10MB</span>, no folders allowed
          </p>
        </div>
      </div>
    </div>
  );
}
