import { useRef, useEffect, useState, useMemo } from "react";
import { Virtuoso } from "react-virtuoso";
import moment from "moment";
import useMessages from "@/hooks/useMessages";
import useGetMessages from "@/hooks/useGetMessages";
import { useSocketStore } from "@/stores/useSocketStore";
import { useUser } from "@/hooks/useUser";
import { useSelectedContact } from "@/hooks/useSelectContact";
import Message from "./message";

const START_INDEX = 100000;

export default function MessagesContainer() {
  const [messagePage, setMessagePage] = useState(1);
  const { messages } = useMessages();
  const { isLoading, hasMore } = useGetMessages(messagePage, setMessagePage);
  const socket = useSocketStore((state) => state.socket);
  const { user } = useUser();
  const { selectedContact } = useSelectedContact();

  const virtuosoRef = useRef(null);
  const lastSeenMessageIdRef = useRef<string | null>(null);

  const firstItemIndex = useMemo(() => {
    return START_INDEX - messages.length;
  }, [messages.length, selectedContact?._id]);

  // Message seen observer logic
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !user) return;

    const observer = new IntersectionObserver((entries) => {
      if (
        entries[0].isIntersecting &&
        !lastMessage.seenBy.includes(user.id) &&
        lastSeenMessageIdRef.current !== lastMessage._id
      ) {
        socket?.emit("message-seen", {
          messageId: lastMessage._id,
          chatId: selectedContact._id,
          seenBy: user?.id,
        });
        lastSeenMessageIdRef.current = lastMessage._id;
      }
    });

    const el = document.querySelector(`[data-message-id='${lastMessage._id}']`);
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, [messages, selectedContact, user, socket]);

  console.log(messagePage);

  return (
    <div className="relative h-full">
      {isLoading && messagePage > 1 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-gray-600 shadow-lg border animate-pulse">
            Loading older messages...
          </div>
        </div>
      )}

      <div className="absolute top-0 left-0 h-20 rounded-tl-xl rounded-tr-xl w-full bg-gradient-to-b from-pure-white to-transparent pointer-events-none z-10" />

      <Virtuoso
        ref={virtuosoRef}
        data={messages}
        firstItemIndex={firstItemIndex}
        initialTopMostItemIndex={messages.length - 1}
        // increaseViewportBy={{ top: 400, bottom: 400 }}
        startReached={() => {
          if (!isLoading && hasMore) {
            setMessagePage((prev) => prev + 1);
          }
        }}
        itemContent={(index, message) => {
          const i = index - firstItemIndex;
          const messageDate = moment(message.createdAt).format("YYYY-MM-DD");
          const prevDate =
            i > 0
              ? moment(messages[i - 1].createdAt).format("YYYY-MM-DD")
              : null;
          const isNewDay = messageDate !== prevDate;

          const nextMessage = messages[i + 1];
          const willChain =
            nextMessage &&
            moment(message.createdAt).isSame(
              moment(nextMessage.createdAt),
              "hour"
            ) &&
            nextMessage.senderDetails._id === message.senderDetails._id;

          const isNewChain =
            !messages[i - 1] ||
            messages[i - 1].senderDetails._id !== message.senderDetails._id;

          return (
            <div
              key={message._id}
              data-message-id={message._id}
              className="px-4"
            >
              <Message
                message={message}
                willChain={willChain}
                isNewDay={isNewDay}
                isNewChain={isNewChain}
              />
            </div>
          );
        }}
        style={{ height: "100%" }}
        followOutput={(isAtBottom) => (isAtBottom ? "smooth" : false)}
        atBottomStateChange={(atBottom) => {
          console.log("At bottom:", atBottom);
        }}
        atTopStateChange={(atTop) => {
          console.log("At top:", atTop);
        }}
      />
    </div>
  );
}
