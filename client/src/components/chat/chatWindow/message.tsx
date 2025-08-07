import { useUser } from "@/hooks/useUser";
import type { MessageType } from "@/types/messageTypes";
import moment from "moment";
import { RiCheckDoubleLine } from "react-icons/ri";

export default function Message({
  message,
  firstElementRef,
  lastElementRef,
  willChain,
  isNewDay,
  isNewChain,
}: {
  message: MessageType;
  firstElementRef?: ((node: HTMLDivElement) => void) | null;
  lastElementRef?: ((node: HTMLDivElement) => void) | null;
  willChain: boolean;
  isNewDay: boolean;
  isNewChain?: boolean;
}) {
  const { user } = useUser();
  const isSender = message.senderDetails._id === user?.id;

  if (message.messageType === "announcement") {
    return (
      <p
        ref={(node) => {
          if (firstElementRef) firstElementRef(node as HTMLDivElement);
          if (lastElementRef) lastElementRef(node as HTMLDivElement);
        }}
        className="w-full flex flex-col gap-2 text-center text-gray-500 text-xs my-1"
      >
        {isNewDay && (
          <span className="text-center text-gray-500 text-xs my-8 flex items-center justify-center w-full gap-2.5">
            <span className="w-[20%] h-[1px] bg-gray-300"></span>
            <span>
              {moment(message.createdAt).local().format("MMM D, YYYY")}
            </span>
            <span className="w-[20%] h-[1px] bg-gray-300"></span>
          </span>
        )}
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
        if (firstElementRef) firstElementRef(node as HTMLDivElement);
        if (lastElementRef) lastElementRef(node as HTMLDivElement);
      }}
      className="w-full flex flex-col"
    >
      {/* {isNewDay && <DateBox date={message.createdAt} />} */}
      <div
        className={`w-fit max-w-[60%] h-fit flex gap-3.5 ${
          isSender ? "self-end flex-row-reverse" : "self-start"
        } ${isNewChain ? "mt-6" : "mt-2"}`}
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

function MessageBox({
  message,
  isSender,
  isNewChain,
}: {
  message: MessageType;
  isSender: boolean;
  isNewChain?: boolean;
}): React.ReactNode {
  const messageType = message.messageType;

  if (isSender && !isNewChain) {
    return (
      <div className="w-fit flex flex-col gap-1">
        <p className={`text-gray text-sm ml-3 text-left`}>
          {message.senderDetails.name}
        </p>
        <div className="flex flex-col gap-2">
          {messageType === "text" || message.summary ? (
            <MessageContent message={message} isSender={isSender} />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="w-fit flex flex-col gap-1">
      <div className="flex flex-col gap-2">
        {messageType === "text" || message.summary ? (
          <MessageContent message={message} isSender={isSender} />
        ) : null}
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
}) {
  const date = moment(message.createdAt).local().format("hh:mm A");
  const hasSeen = message.seenBy.length > 0;

  return (
    <div
      className={`w-fit h-fit p-3 flex flex-col gap-1 bg-[#F7F7F7] rounded-lg ${
        isSender ? "rounded-br-none" : "rounded-bl-none"
      }`}
    >
      <p>{message.summary}</p>
      <div
        className={`${
          isSender ? "self-end" : "self-start"
        } flex gap-1 items-center`}
      >
        <p className="text-xs text-gray">{date}</p>
        {isSender && (
          <RiCheckDoubleLine
            className={`text-sm ${hasSeen ? "text-teal" : "text-gray"}`}
          />
        )}
      </div>
    </div>
  );
}
