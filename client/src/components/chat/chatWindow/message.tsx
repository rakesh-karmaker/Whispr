import { useUser } from "@/hooks/useUser";
import type { MessageType } from "@/types/messageTypes";
import moment from "moment";

export default function Message({
  message,
  firstElementRef,
  lastElementRef,
}: {
  message: MessageType;
  firstElementRef: ((node: HTMLDivElement) => void) | null;
  lastElementRef: ((node: HTMLDivElement) => void) | null;
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
        className="w-full text-center text-gray-500 text-xs my-1"
        data-message-id={message._id}
      >
        <span className="font-semibold">
          {isSender ? "You" : message.announcer}
        </span>{" "}
        {message.summary}
      </p>
    );
  }

  return (
    <div
      ref={(node) => {
        if (firstElementRef) firstElementRef(node as HTMLDivElement);
        if (lastElementRef) lastElementRef(node as HTMLDivElement);
      }}
      className={`w-fit h-fit flex gap-3.5 ${
        isSender ? "self-end flex-row-reverse" : "self-start"
      } mt-6`}
      data-message-id={message._id}
    >
      <img
        src={message.senderDetails.avatar}
        alt={message.senderDetails.name}
        className="min-w-13 max-w-13 aspect-square rounded-full object-cover object-center"
      />
    </div>
  );
}

// function MessageBox({ message }: { message: MessageType }): React.ReactNode {
//   const messageType = message.messageType;
//   const date = moment(message.createdAt).local().format("hh:mm A");
// }
