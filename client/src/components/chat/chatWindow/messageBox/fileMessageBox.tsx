import type { FileMessageType, MessageType } from "@/types/messageTypes";
import TextMessageBox from "./textMessageBox";
import { FaFile } from "react-icons/fa";
import moment from "moment";
import filterPublicId from "@/utils/filterPublicId";

export default function FileMessageBox({
  message,
  files,
  isSender,
  isHybrid,
}: {
  message: MessageType;
  files: FileMessageType[];
  isSender: boolean;
  isHybrid?: boolean;
}): React.ReactNode {
  const handleDownload = async (fileData: FileMessageType) => {
    const title = filterPublicId(fileData.publicId);
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
    <div
      className={`w-full flex flex-col gap-2 ${
        isSender ? "items-end" : "items-start"
      }`}
    >
      {message.content && !isHybrid ? (
        <TextMessageBox message={message} isSender={isSender} />
      ) : null}
      {files.map((file) => {
        const title = filterPublicId(file.publicId);
        const fileSize: number = parseFloat(
          ((file.size ?? 0) / 1024).toFixed(2)
        );
        return (
          <button
            type="button"
            className="bg-white-2 dark:bg-d-light-dark-gray p-1 w-full max-w-65 h-full flex rounded-lg text-left cursor-pointer"
            key={file.publicId}
            onClick={() => handleDownload(file)}
            rel="noopener noreferrer"
          >
            <div className="w-fit flex items-center justify-center rounded-md px-3 pr-4">
              <FaFile className="text-blue text-2xl" />
            </div>
            <div className="flex flex-col gap-2 justify-between bg-pure-white dark:bg-d-dark-gray p-2 rounded-md w-full min-w-40 rounded-tl-none rounded-bl-none hover:bg-white-2 dark:hover:bg-d-light-dark-gray transition-all duration-200">
              <span className="text-sm font-medium text-black line-clamp-2 dark:text-d-white/90">
                {title}
              </span>
              <div className="w-full flex justify-between items-center gap-4">
                <span className="text-xs text-gray line-clamp-2 dark:text-d-white/45">
                  {fileSize > 1024
                    ? `${(fileSize / 1024).toFixed(2)} MB`
                    : `${fileSize} KB`}
                </span>
                <span className="text-xs text-gray dark:text-d-white/45">
                  {moment(message.createdAt).local().format("h:mm")}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
