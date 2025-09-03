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
  async function handleDrop(
    event: React.DragEvent<HTMLDivElement>
  ): Promise<void> {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    const items = Array.from(event.dataTransfer.items);

    // Handle direct file drops
    const validFiles = droppedFiles.filter((file) => {
      return (
        file.size <= 10 * 1024 * 1024 &&
        file.type &&
        !file.type.includes("folder")
      );
    });

    // Handle URL drops (images from web)
    const urlPromises: Promise<File | null>[] = [];
    for (const item of items) {
      if (item.type === "text/uri-list") {
        const promise = new Promise<File | null>((resolve) => {
          item.getAsString(async (url) => {
            if (url && url.startsWith("http")) {
              try {
                const response = await fetch(url);
                const blob = await response.blob();
                if (blob.type.startsWith("image/")) {
                  const file = new File([blob], `image-${Date.now()}.png`, {
                    type: blob.type,
                  });
                  resolve(file);
                } else {
                  resolve(null);
                }
              } catch (error) {
                console.error("Failed to fetch image from URL:", error);
                resolve(null);
              }
            } else {
              resolve(null);
            }
          });
        });
        urlPromises.push(promise);
      }
    }

    // Wait for all URL fetches to complete
    const urlFiles = (await Promise.all(urlPromises)).filter(
      (file) => file !== null
    ) as File[];

    // Combine valid files and fetched URL files
    const allFiles = [...validFiles, ...urlFiles];
    if (allFiles.length > 0) {
      setFiles((prevFiles) => [...prevFiles, ...allFiles]);
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
