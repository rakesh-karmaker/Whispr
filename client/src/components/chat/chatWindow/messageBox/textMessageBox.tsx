import type { MessageType } from "@/types/messageTypes";
import Tooltip from "@mui/material/Tooltip";
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
      className={`w-fit h-fit p-3 flex flex-col gap-1 bg-[#F7F7F7] dark:bg-d-light-dark-gray rounded-lg ${
        isSender ? "rounded-br-none" : "rounded-bl-none"
      }`}
    >
      <p className="text-[0.85em]/[150%] dark:text-d-white/90">
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
        <p className="text-[0.67rem] text-gray dark:text-d-white/45">{date}</p>
        {isSender && (
          <Tooltip title={hasSeen ? "Seen" : "Delivered"} arrow>
            <RiCheckDoubleLine
              className={`text-xs ${hasSeen ? "text-teal" : "text-gray"}`}
            />
          </Tooltip>
        )}
      </div>
    </div>
  );
}
