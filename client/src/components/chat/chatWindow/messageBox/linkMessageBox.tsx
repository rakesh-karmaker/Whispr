import { GoArrowUpRight } from "react-icons/go";
import TextMessageBox from "./textMessageBox";
import type { MessageType } from "@/types/messageTypes";
import { useState } from "react";

export default function LinkMessageBox({
  message,
  isSender,
  isHybrid = false,
}: {
  message: MessageType;
  isSender: boolean;
  isHybrid?: boolean;
}): React.ReactNode {
  if (!message.link) {
    return <TextMessageBox message={message} isSender={isSender} />;
  }

  if (!message.link?.imageURL || !message.link?.title || !message.link?.url) {
    return <TextMessageBox message={message} isSender={isSender} />;
  }

  const [isImageUrlValid, setIsImageUrlValid] = useState(true);

  if (message.link.imageURL) {
    const img = new Image();
    img.src = message.link.imageURL;
    img.onload = () => setIsImageUrlValid(true);
    img.onerror = () => setIsImageUrlValid(false);
  }

  return (
    <div
      className={`w-full flex flex-col gap-2 ${
        isSender ? "items-end" : "items-start"
      }`}
    >
      <a
        href={message.link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex flex-col gap-2 w-full max-w-80 h-fit p-2 rounded-lg text-gray hover:text-teal transition-all duration-200 bg-white-2 ${
          isSender ? "rounded-br-none" : "rounded-bl-none"
        }`}
      >
        {message.link.imageURL && isImageUrlValid && (
          <div
            style={{
              backgroundImage: `url(${message.link.imageURL})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            className="w-full rounded-md aspect-[16/9] object-cover object-center min-w-[304px] min-h-[171px]"
          />
        )}
        <div className="w-full flex justify-between gap-4">
          <p className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-black line-clamp-2">
              {message.link.title}
            </span>
            <span className="text-xs text-gray line-clamp-1">
              {message.link.url}
            </span>
          </p>
          <GoArrowUpRight className="text-lg min-w-fit" />
        </div>
      </a>
      {message.content && !isHybrid ? (
        <TextMessageBox message={message} isSender={isSender} />
      ) : null}
    </div>
  );
}
