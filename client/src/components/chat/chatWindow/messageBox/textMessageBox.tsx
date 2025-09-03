import type { MessageType } from "@/types/messageTypes";
import moment from "moment";
import { RiCheckDoubleLine } from "react-icons/ri";

export default function TextMessageBox({
  message,
  isSender,
}: {
  message: MessageType;
  isSender: boolean;
}): React.ReactNode {
  const date = moment(message.createdAt).local().format("hh:mm A");
  const hasSeen = message.seenBy.length > 0;
  const linkRegex = /https?:\/\/[^\s]+/g;

  return (
    <div
      className={`w-fit h-fit p-3 flex flex-col gap-1 bg-[#F7F7F7] rounded-lg ${
        isSender ? "rounded-br-none" : "rounded-bl-none"
      }`}
    >
      <p className="text-[0.93em]/[140%]">
        {message.content &&
          message.content.split(" ").map((word, index) => {
            const isLink = linkRegex.test(word);
            return isLink ? (
              <a
                key={index}
                href={word}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal hover:underline transition-all duration-200 cursor-pointer"
              >
                {word}{" "}
              </a>
            ) : (
              <span key={index}>{word} </span>
            );
          })}
      </p>
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
