import { useUser } from "@/hooks/useUser";
import type { MessageType } from "@/types/messageTypes";
import moment from "moment";
import TextMessageBox from "./messageBox/textMessageBox";
import { GoArrowUpRight } from "react-icons/go";

export default function Message({
  message,
  lastElementRef,
  willChain,
  isNewDay,
  isNewChain,
  onImageClick,
}: {
  message: MessageType;
  lastElementRef: ((node: HTMLDivElement) => void) | null;
  willChain: boolean;
  isNewDay: boolean;
  isNewChain?: boolean;
  onImageClick?: () => void;
}): React.ReactNode {
  const { user } = useUser();
  const isSender = message.senderDetails._id === user?.id;

  if (message.messageType === "announcement") {
    return (
      <p
        ref={(node) => {
          if (lastElementRef) lastElementRef(node as HTMLDivElement);
        }}
        className="w-full flex flex-col gap-2 text-center text-gray-500 text-xs my-1"
      >
        {isNewDay && <DateBox data={message.createdAt} />}
        <span>
          <span className="font-semibold">
            {isSender ? "You" : message.announcer}
          </span>{" "}
          {message.summary}
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
        />
      </div>
    </div>
  );
}

function DateBox({ data }: { data: Date }) {
  return (
    <span className="text-center text-gray-500 text-xs my-8 flex items-center justify-center w-full gap-2.5">
      <span className="w-[20%] h-[1px] bg-gray-300"></span>
      <span>{moment(data).local().format("MMM D, YYYY")}</span>
      <span className="w-[20%] h-[1px] bg-gray-300"></span>
    </span>
  );
}

function MessageBox({
  message,
  isSender,
  isNewChain,
}: {
  message: MessageType;
  isSender: boolean;
  isNewChain?: boolean;
}): React.ReactNode {
  return (
    <div className="w-fit flex flex-col gap-1">
      {!isSender && isNewChain && (
        <p className={`text-gray text-sm ml-3 text-left`}>
          {message.senderDetails.name}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <MessageContent message={message} isSender={isSender} />
      </div>
    </div>
  );
}

function MessageContent({
  message,
  isSender,
}: {
  message: MessageType;
  isSender: boolean;
}): React.ReactNode {
  const messageType = message.messageType;

  switch (messageType) {
    case "text":
      return <TextMessageBox message={message} isSender={isSender} />;
    case "link":
      return <LinkMessageBox message={message} isSender={isSender} />;
  }
}

function LinkMessageBox({
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

  if (!message.link?.imageURL) {
    return (
      <TextMessageBox message={message} isSender={isSender} isLink={true} />
    );
  }

  return (
    <div className="w-full flex flex-col items-end gap-2">
      <a
        href={message.link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex flex-col gap-2 w-full max-w-80 h-fit p-2 rounded-lg text-gray hover:text-teal transition-all duration-200 bg-white-2 ${
          isSender ? "rounded-br-none" : "rounded-bl-none"
        }`}
      >
        <img
          src={message.link.imageURL}
          alt={message.link.title}
          className="w-full rounded-md aspect-[16/9] object-cover object-center"
        />
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
