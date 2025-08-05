import useGetMessages from "@/hooks/useGetMessages";
import useMessages from "@/hooks/useMessages";
import moment from "moment";
import type React from "react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import Message from "./message";
import { useSocketStore } from "@/stores/useSocketStore";
import { useUser } from "@/hooks/useUser";
import { useSelectedContact } from "@/hooks/useSelectContact";

export default function MessagesContainer(): React.ReactNode {
  const [messagePage, setMessagePage] = useState(1);
  const { messages } = useMessages();
  const socket = useSocketStore((state) => state.socket);
  const { user } = useUser();
  const { selectedContact } = useSelectedContact();
  const { isLoading, hasMore } = useGetMessages(messagePage, setMessagePage);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeight = useRef<number>(0);
  let lastDate: string | null = null;

  const observer = useRef<IntersectionObserver | null>(null);
  const firstElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setMessagePage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore]
  );

  const seenObserver = useRef<IntersectionObserver | null>(null);
  const lastSeenMessageIdRef = useRef<string | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (seenObserver.current) seenObserver.current.disconnect();
      seenObserver.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          messages.length > 0 &&
          user &&
          !messages[messages.length - 1].seenBy.includes(user.id) &&
          lastSeenMessageIdRef.current !== messages[messages.length - 1]._id // guard
        ) {
          socket?.emit("message-seen", {
            messageId: messages[messages.length - 1]._id,
            chatId: selectedContact._id,
            seenBy: user?.id,
          });
          lastSeenMessageIdRef.current = messages[messages.length - 1]._id;
        }
      });
      if (node) seenObserver.current.observe(node);
    },
    [socket, messages, selectedContact, user]
  );

  useEffect(() => {
    // Scroll to the bottom only once when the component mounts
    if (scrollRef.current && messagePage === 1) {
      scrollRef.current.scrollIntoView();
    }
    if (!isLoading && messagePage > 1) {
      const newScrollHeight = containerRef.current?.scrollHeight ?? 0;
      const diff = newScrollHeight - prevScrollHeight.current;
      containerRef.current?.scrollBy({ top: diff });
    }
    if (containerRef.current && messagePage === 1) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      prevScrollHeight.current = containerRef.current?.scrollHeight ?? 0;
    }
  }, [isLoading]);

  return (
    <>
      <div className="absolute top-0 left-0 h-20 rounded-tl-xl rounded-tr-xl w-full bg-gradient-to-b from-pure-white to-transparent pointer-events-none"></div>
      <div
        ref={containerRef}
        className="w-full max-h-[calc(100svh-(5.5em+3em+5em))] overflow-y-auto flex flex-col px-4"
      >
        {messages.map((message, index) => {
          const messageDate = moment(message.createdAt).format("YYYY-MM-DD");
          const isNewDay = messageDate !== lastDate;
          lastDate = messageDate;
          return (
            <Fragment key={message._id}>
              {isNewDay && <DateBox date={message.createdAt} />}
              <Message
                message={message}
                firstElementRef={index === 0 ? firstElementRef : null}
                lastElementRef={
                  index === messages.length - 1 ? lastElementRef : null
                }
              />
            </Fragment>
          );
        })}
        <div ref={scrollRef} />
      </div>
    </>
  );
}

function DateBox({ date }: { date: string | Date }): React.ReactNode {
  return (
    <div className="text-center text-gray-500 text-xs my-8 flex items-center justify-center w-full gap-2.5">
      <span className="w-[20%] h-[1px] bg-gray-300"></span>
      <span>{moment(date).local().format("MMM D, YYYY")}</span>
      <span className="w-[20%] h-[1px] bg-gray-300"></span>
    </div>
  );
}
