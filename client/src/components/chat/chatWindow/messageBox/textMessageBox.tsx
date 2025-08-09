import type { MessageType } from "@/types/messageTypes";
import moment from "moment";
import { RiCheckDoubleLine } from "react-icons/ri";

export default function TextMessageBox({
  message,
  isSender,
  isLink = false,
}: {
  message: MessageType;
  isSender: boolean;
  isLink?: boolean;
}): React.ReactNode {
  const date = moment(message.createdAt).local().format("hh:mm A");
  const hasSeen = message.seenBy.length > 0;

  return (
    <div
      className={`w-fit h-fit p-3 flex flex-col gap-1 bg-[#F7F7F7] rounded-lg ${
        isSender ? "rounded-br-none" : "rounded-bl-none"
      }`}
    >
      {isLink ? (
        <a
          href={message.link?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal hover:underline text-[0.98em]/[140%] transition-all duration-200 cursor-pointer"
        >
          {message.link?.url}
        </a>
      ) : (
        <p className="text-[0.98em]/[140%]">{message.content}</p>
      )}
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
