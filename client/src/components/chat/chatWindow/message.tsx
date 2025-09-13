import { useUser } from "@/hooks/useUser";
import type { FileMessageType, MessageType } from "@/types/messageTypes";
import moment from "moment";
import TextMessageBox from "./messageBox/textMessageBox";
import LinkMessageBox from "./messageBox/linkMessageBox";
import ImageMessageBox from "./messageBox/imageMessageBox";
import React from "react";
import FileMessageBox from "./messageBox/fileMessageBox";

export default function Message({
  message,
  lastElementRef,
  willChain,
  isNewDay,
  isNewChain,
  onImageClick,
}: {
  message: MessageType;
  lastElementRef?: ((node: HTMLDivElement) => void) | null;
  willChain: boolean;
  isNewDay: boolean;
  isNewChain?: boolean;
  onImageClick: (publicId: string) => void;
}): React.ReactNode {
  const { user } = useUser();
  const isSender = message.senderDetails._id === user?.id;

  if (message.messageType === "announcement") {
    return (
      <p
        ref={(node) => {
          if (lastElementRef) lastElementRef(node as HTMLDivElement);
        }}
        className="w-full flex flex-col gap-2 text-center text-gray-500 dark:text-d-white/50 text-xs py-1"
      >
        {isNewDay && <DateBox data={message.createdAt} />}
        <span>
          {isSender ? "You" : message.announcer} {message.summary}
        </span>
      </p>
    );
  }

  return (
    <div
      ref={(node) => {
        if (lastElementRef) lastElementRef(node as HTMLDivElement);
      }}
      className="w-full flex flex-col"
    >
      {isNewDay && <DateBox data={message.createdAt} />}
      <div
        className={`w-fit max-w-[60%] h-fit flex gap-3.5 ${
          isSender ? "self-end flex-row-reverse" : "self-start"
        } ${!isSender && isNewChain ? "mt-6" : "mt-3"}`}
      >
        {willChain ? (
          <div className="min-w-10 max-w-10 min-h-10 max-h-10" />
        ) : (
          <img
            src={message.senderDetails.avatar}
            alt={message.senderDetails.name}
            className="min-w-10 max-w-10 min-h-10 max-h-10 aspect-square rounded-full object-cover object-center self-end"
          />
        )}
        <MessageBox
          message={message}
          isSender={isSender}
          isNewChain={isNewChain}
          onImageClick={onImageClick}
        />
      </div>
    </div>
  );
}

function DateBox({ data }: { data: Date }) {
  return (
    <span className="text-center text-gray-500 dark:text-d-white/50 text-xs py-8 flex items-center justify-center w-full gap-2.5">
      <span className="w-[20%] h-[1px] bg-gray-300 dark:bg-d-light-dark-gray"></span>
      <span>{moment(data).local().format("MMM D, YYYY")}</span>
      <span className="w-[20%] h-[1px] bg-gray-300 dark:bg-d-light-dark-gray"></span>
    </span>
  );
}

function MessageBox({
  message,
  isSender,
  isNewChain,
  onImageClick,
}: {
  message: MessageType;
  isSender: boolean;
  isNewChain?: boolean;
  onImageClick: (publicId: string) => void;
}): React.ReactNode {
  return (
    <div className="w-fit flex flex-col gap-1">
      {!isSender &&
        isNewChain && ( //TODO: fix this
          <p
            className={`text-gray text-sm ml-1 text-left dark:text-d-white/50`}
          >
            {message.senderDetails.name.split(" ")[0]}
          </p>
        )}
      <div className="flex flex-col gap-2">
        <MessageContent
          message={message}
          isSender={isSender}
          onImageClick={onImageClick}
        />
      </div>
    </div>
  );
}

function MessageContent({
  message,
  isSender,
  onImageClick,
}: {
  message: MessageType;
  isSender: boolean;
  onImageClick: (publicId: string) => void;
}): React.ReactNode {
  const messageType = message.messageType;

  switch (messageType) {
    case "text":
      return <TextMessageBox message={message} isSender={isSender} />;
    case "link":
      return <LinkMessageBox message={message} isSender={isSender} />;
    case "image":
      return (
        <ImageMessageBox
          message={message}
          images={message.files || []}
          isSender={isSender}
          onImageClick={onImageClick}
        />
      );
    case "file":
      return (
        <FileMessageBox
          message={message}
          files={message.files || []}
          isSender={isSender}
        />
      );

    case "hybrid":
      const images: FileMessageType[] = [];
      const files: FileMessageType[] = [];

      message.files?.forEach((file) => {
        if (file.publicId.startsWith("whispr/images/")) {
          images.push(file);
        } else {
          files.push(file);
        }
      });

      return (
        <div
          className={`w-full flex flex-col gap-2 ${
            isSender ? "items-end" : "items-start"
          }`}
        >
          {message.content && (
            <TextMessageBox message={message} isSender={isSender} />
          )}
          {images.length > 0 && (
            <ImageMessageBox
              message={message}
              images={images}
              isSender={isSender}
              onImageClick={onImageClick}
              isHybrid={true}
            />
          )}
          {files.length > 0 && (
            <FileMessageBox
              message={message}
              files={files}
              isSender={isSender}
              isHybrid={true}
            />
          )}
          {message.link && message.link.url && (
            <LinkMessageBox
              message={message}
              isSender={isSender}
              isHybrid={true}
            />
          )}
        </div>
      );
    default:
      return <TextMessageBox message={message} isSender={isSender} />;
  }
}
