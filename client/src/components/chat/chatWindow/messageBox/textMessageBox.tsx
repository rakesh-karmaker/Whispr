import type { MessageType } from "@/types/messageTypes";
import Tooltip from "@mui/material/Tooltip";
import moment from "moment";
import { RiCheckDoubleLine } from "react-icons/ri";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TextMessageBox({
  message,
  isSender,
}: {
  message: MessageType;
  isSender: boolean;
}): React.ReactNode {
  const date = moment(message.createdAt).local().format("hh:mm A");
  const fullDate = moment(message.createdAt)
    .local()
    .format("MM/DD/YYYY, h:mm A");
  const hasSeen = message.seenBy.length > 0;

  const PlainText = (props: React.HTMLAttributes<HTMLElement>) => (
    <span>{props.children}</span>
  );

  return (
    <div
      className={`w-fit h-fit p-3 flex flex-col gap-1 bg-[#F7F7F7] dark:bg-d-light-dark-gray rounded-lg ${
        isSender ? "rounded-br-none" : "rounded-bl-none"
      }`}
    >
      <div
        className="text-[0.85em]/[150%] dark:text-d-white/90"
        style={{
          wordBreak: "break-word",
        }}
      >
        <Markdown
          components={{
            a: ({ node, ...props }) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal hover:underline transition-all duration-200 cursor-pointer"
              />
            ),
            strong: ({ node, ...props }) => <strong {...props} />,
            em: ({ node, ...props }) => <em {...props} />,
            // Override all other elements to render as plain text
            h1: PlainText,
            h2: PlainText,
            h3: PlainText,
            h4: PlainText,
            h5: PlainText,
            h6: PlainText,
            ul: PlainText,
            ol: PlainText,
            li: PlainText,
            blockquote: PlainText,
            code: PlainText,
            pre: PlainText,
            img: PlainText,
            p: PlainText,
            del: PlainText,
            table: PlainText,
            thead: PlainText,
            tbody: PlainText,
            tr: PlainText,
            td: PlainText,
            th: PlainText,
          }}
          rehypePlugins={[remarkGfm]}
        >
          {message.content}
        </Markdown>
      </div>
      <div
        className={`${
          isSender ? "self-end" : "self-start"
        } flex gap-1 items-center cursor-default`}
      >
        <Tooltip
          title={<p className="text-[0.75rem]">{fullDate}</p>}
          placement="top"
          arrow
        >
          <p className="text-[0.6rem] text-gray dark:text-d-white/45">{date}</p>
        </Tooltip>
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
