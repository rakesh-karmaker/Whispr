import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import moment from "moment";
import useMessages from "@/hooks/useMessages";
import useGetMessages from "@/hooks/useGetMessages";
import { useSocketStore } from "@/stores/useSocketStore";
import { useUser } from "@/hooks/useUser";
import { useSelectedContact } from "@/hooks/useSelectContact";
import Message from "./message";
import type { MessageType } from "@/types/messageTypes";
import ImageViewer from "@/components/ui/imageViewer";

export default function MessagesContainer({ files }: { files: File[] }) {
  const { messages } = useMessages();
  useGetMessages(1);
  const socket = useSocketStore((state) => state.socket);
  const { user } = useUser();
  const { selectedContact } = useSelectedContact();
  const lastSeenMessageIdRef = useRef<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const seenObserver = useRef<IntersectionObserver | null>(null);
  const [imageUrls, setImageUrls] = useState<{ url: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  // Optimize message seen observer with better cleanup
  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      // Clean up previous observer
      if (seenObserver.current) {
        seenObserver.current.disconnect();
        seenObserver.current = null;
      }

      if (!node || !user || !socket || !selectedContact) return;

      seenObserver.current = new IntersectionObserver(
        (entries) => {
          const lastMessage = messages[messages.length - 1];
          if (!lastMessage || !user) return;

          const entry = entries[0];
          if (
            entry.isIntersecting &&
            !lastMessage.seenBy.includes(user.id) &&
            lastSeenMessageIdRef.current !== lastMessage._id
          ) {
            socket.emit("message-seen", {
              messageId: lastMessage._id,
              chatId: selectedContact._id,
              seenBy: user.id,
            });
            lastSeenMessageIdRef.current = lastMessage._id;
          }
        },
        {
          threshold: 0.1,
          rootMargin: "0px",
        }
      );

      seenObserver.current.observe(node);
    },
    [messages, selectedContact, user, socket]
  );

  function handleImageClick(imageIndex: number) {
    setIndex(imageIndex);
    setOpen(true);
  }

  // Optimize computed messages with better memoization
  const computedMessages = useMemo(() => {
    if (!messages.length) return [];

    let lastChainId = "";
    return messages.map((message, i) => {
      const messageDate = moment(message.createdAt).format("YYYY-MM-DD");
      const prevDate =
        i > 0 ? moment(messages[i - 1].createdAt).format("YYYY-MM-DD") : null;
      const isNewDay = messageDate !== prevDate;
      const nextMessage = messages[i + 1];

      const willChain =
        nextMessage &&
        moment(message.createdAt).isSame(
          moment(nextMessage.createdAt),
          "hour"
        ) &&
        nextMessage.senderDetails._id === message.senderDetails._id;

      const isNewChain = lastChainId !== message.senderDetails._id && willChain;

      if (willChain) {
        lastChainId = message.senderDetails._id;
      } else {
        lastChainId = "";
      }

      if (
        (message.messageType == "file" || message.messageType == "hybrid") &&
        message.files
      ) {
        message.files.forEach((file) => {
          if (file.publicId.startsWith("whisper/images/")) {
            setImageUrls((prev) => [...prev, { url: file.url }]);
          }
        });
      }

      return {
        message,
        isNewDay,
        willChain,
        isNewChain,
      };
    });
  }, [messages]);

  // Handle initial scroll on mount and when contact changes
  useEffect(() => {
    if (computedMessages.length > 0 && !isInitialized) {
      // Delay initial scroll to ensure Virtuoso is ready
      const timer = setTimeout(() => {
        setIsInitialized(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [computedMessages.length, isInitialized]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (seenObserver.current) {
        seenObserver.current.disconnect();
        seenObserver.current = null;
      }
    };
  }, []);

  // Memoize item renderer to prevent unnecessary re-renders
  const itemRenderer = useCallback(
    (
      index: number,
      {
        message,
        isNewDay,
        isNewChain,
        willChain,
      }: {
        message: MessageType;
        isNewDay: boolean;
        isNewChain: boolean;
        willChain: boolean;
      }
    ) => {
      const isLastMessage = index === computedMessages.length - 1;

      return (
        <div
          key={message._id}
          data-message-id={message._id}
          className="w-full flex flex-col px-4"
        >
          <Message
            message={message}
            willChain={willChain}
            isNewChain={isNewChain}
            isNewDay={isNewDay}
            lastElementRef={isLastMessage ? lastElementRef : null}
            onImageClick={() => handleImageClick(index)}
          />
        </div>
      );
    },
    [computedMessages.length, lastElementRef]
  );
  const scrollToRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToRef.current && isInitialized) {
      scrollToRef.current.scrollIntoView();
    }
  }, [isInitialized]);

  if (!computedMessages.length) {
    return (
      <div className="relative h-full flex items-center justify-center text-gray-500">
        No messages yet
      </div>
    );
  }

  return (
    <>
      <div
        className="relative h-full flex-1 overflow-y-auto"
        style={{
          maxHeight: "calc(100vh - 9.5rem)",
          paddingBottom: "6rem",
        }}
      >
        <div className="absolute top-0 left-0 h-20 rounded-tl-xl rounded-tr-xl w-full bg-gradient-to-b from-pure-white to-transparent pointer-events-none z-10" />

        {computedMessages.map((item, index) => (
          <div
            key={item.message._id}
            data-message-id={item.message._id}
            className="w-full flex flex-col px-4"
          >
            {itemRenderer(index, item)}
          </div>
        ))}
        <div ref={scrollToRef}></div>
      </div>
      <ImageViewer
        data={imageUrls}
        open={open}
        setOpen={setOpen}
        index={index}
      />
    </>
  );
}
