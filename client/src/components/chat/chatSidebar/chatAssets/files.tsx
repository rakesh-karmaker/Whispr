import LinkPreviewSkeleton from "@/components/ui/skeletons/linkPreviewSkeleton";
import { useContactAssets } from "@/hooks/useContactAssets";
import useGetAssets from "@/hooks/useGetAssets";
import type { FileMessageType } from "@/types/messageTypes";
import filterPublicId from "@/utils/filterPublicId";
import type React from "react";
import { useCallback, useRef } from "react";
import { FaFile } from "react-icons/fa";

export default function Files(): React.ReactNode {
  const { files, hasMoreFiles, filePage, setFilePage, setHasMoreFiles } =
    useContactAssets();
  const { isLoading } = useGetAssets(
    filePage,
    hasMoreFiles,
    setHasMoreFiles,
    "file"
  );

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreFiles) {
          setFilePage(filePage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMoreFiles]
  );

  const length = files ? files.length : 0;

  return (
    <div className="w-full h-full grid grid-cols-1 gap-2.5 overflow-hidden">
      {files.map((file, index) => {
        return (
          <File
            key={`${file.publicId}-${index}`}
            fileData={file}
            lastElementRef={index === length - 1 ? lastElementRef : null}
          />
        );
      })}
      {isLoading &&
        hasMoreFiles &&
        [...Array(2)].map((_, index) => <LinkPreviewSkeleton key={index} />)}
    </div>
  );
}

function File({
  fileData,
  lastElementRef,
}: {
  fileData: FileMessageType;
  lastElementRef: ((node: HTMLDivElement) => void) | null;
}) {
  if (!fileData.url || !fileData.publicId || !fileData.size) return null;
  const title = filterPublicId(fileData.publicId);
  const handleDownload = async () => {
    const response = await fetch(fileData.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = title;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div ref={lastElementRef}>
      <button
        rel="noopener noreferrer"
        className="text-sm w-full relative h-fit flex justify-start text-left border-none outline-none gap-2.5 rounded-md items-center bg-pure-white hover:bg-white-2 transition-all duration-200 cursor-pointer"
        onClick={handleDownload}
        type="button"
      >
        <div className="min-w-15 aspect-square rounded-md bg-gray-200 flex items-center justify-center">
          <FaFile className="text-gray-500 text-2xl" />
        </div>
        <span className="w-full flex flex-col">
          <span title={title}>
            {title.length > 30 ? `${title.slice(0, 30)}...` : title}
          </span>

          <span className="text-gray-500 text-xs">
            {fileData.size
              ? `${(fileData.size / 1024).toFixed(2)} KB`
              : "Unknown size"}
          </span>
        </span>
      </button>
    </div>
  );
}
