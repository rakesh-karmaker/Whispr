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
import Loader from "@/components/ui/Loader/Loader";
import { useVirtualizer } from "@tanstack/react-virtual";
import { IoArrowDown } from "react-icons/io5";
import Tooltip from "@mui/material/Tooltip";

export default function MessagesContainer() {
  const { messages } = useMessages();
  const { isLoading: isLoadingMessages } = useGetMessages();
  const socket = useSocketStore((state) => state.socket);
  const { user } = useUser();
  const { selectedContact } = useSelectedContact();
  const lastSeenMessageIdRef = useRef<string | null>(null);
  const seenObserver = useRef<IntersectionObserver | null>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(true);

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

  function handleImageClick(publicId: string) {
    const imageIndex = imageUrls.findIndex(
      (image) => image.publicId === publicId
    );
    setIndex(imageIndex);
    setOpen(true);
  }

  // Optimize computed messages with better memoization
  const computedMessages = useMemo(() => {
    if (!messages.length) return [];

    let lastChainId = "";
    return messages.map((message, i) => {
      const messageDate = moment(message.createdAt).format("YYYY-MM-DD");
      const prevMessage = i > 0 ? messages[i - 1] : null;
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
        nextMessage.senderDetails._id === message.senderDetails._id &&
        nextMessage.messageType !== "announcement";

      const isNewChain =
        lastChainId !== message.senderDetails._id ||
        prevMessage?.messageType === "announcement";

      if (willChain) {
        lastChainId = message.senderDetails._id;
      } else {
        lastChainId = "";
      }

      const needSpace =
        message.messageType === "announcement" &&
        !isNewDay &&
        prevMessage?.messageType !== "announcement";

      return {
        message,
        isNewDay,
        willChain,
        isNewChain,
        needSpace,
      };
    });
  }, [messages]);

  // Optimize imageUrls extraction with useMemo
  const imageUrls = useMemo(() => {
    const newImageUrls: { url: string; publicId: string }[] = [];
    messages.forEach((message) => {
      if (
        (message.messageType === "image" || message.messageType === "hybrid") &&
        message.files
      ) {
        message.files.forEach((file) => {
          if (file.publicId.startsWith("whispr/images/")) {
            newImageUrls.push({ url: file.url, publicId: file.publicId });
          }
        });
      }
    });
    return newImageUrls;
  }, [messages]);

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
        needSpace,
      }: {
        message: MessageType;
        isNewDay: boolean;
        isNewChain: boolean;
        willChain: boolean;
        needSpace: boolean;
      }
    ) => {
      const isLastMessage = index === computedMessages.length - 1;

      return (
        <div
          key={message._id}
          data-message-id={message._id}
          className="w-full flex flex-col"
        >
          <Message
            message={message}
            willChain={willChain}
            isNewChain={isNewChain}
            isNewDay={isNewDay}
            needSpace={needSpace}
            lastElementRef={isLastMessage ? lastElementRef : null}
            onImageClick={handleImageClick}
          />
        </div>
      );
    },
    [computedMessages.length, lastElementRef]
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const count = messages.length;
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40, // Slightly higher for better accuracy with images
    overscan: 10, // Increased for large lists
    measureElement: (el) => {
      return el.getBoundingClientRect().height;
    },
  });

  const items = virtualizer.getVirtualItems();

  useEffect(() => {
    virtualizer.measure();
    if (isLoadingMessages) {
      setIsLoading(true);
    } else {
      if (count > 0 && !isLoadingMessages) {
        // wait a frame so element measurements from refs are applied, then scroll to the last item
        requestAnimationFrame(() => {
          setTimeout(() => {
            virtualizer.scrollToIndex(count - 1, { align: "end" });
          }, 100);
          setTimeout(() => {
            setIsLoading(false);
          }, 0);
        });
      }
    }
  }, [isLoadingMessages]);

  useEffect(() => {
    virtualizer.scrollToIndex(count - 1, { align: "end" });
  }, [messages]);

  // Detect if user is at bottom
  useEffect(() => {
    const handleScroll = () => {
      if (parentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
        setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 300); // 300px threshold
      }
    };

    parentRef.current?.addEventListener("scroll", handleScroll);
    return () => {
      parentRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Detect if chat changed
  useEffect(() => {
    setIsAtBottom(true);
  }, [selectedContact]);

  // Scroll to bottom
  function bottomClick() {
    virtualizer.scrollToIndex(count - 1, { align: "end" });
    setIsAtBottom(true);
  }

  return (
    <div
      className="w-full h-full dark:bg-d-dark-gray rounded-xl"
      style={{
        maxHeight: `100%`,
      }}
    >
      <div
        className="relative w-full h-full flex justify-center items-center dark:bg-d-dark-gray rounded-xl"
        style={{
          maxHeight: `100%`,
        }}
      >
        <div className="absolute top-0 left-0 h-10 rounded-tl-xl rounded-tr-xl w-full bg-gradient-to-b from-pure-white dark:from-d-dark-gray to-transparent pointer-events-none z-10" />
        <div
          className={`w-full h-full absolute z-20 bg-pure-white dark:bg-d-dark-gray rounded-xl bottom-0 left-0 flex justify-center items-center ${
            isLoading ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Loader />
        </div>
        <div
          ref={parentRef}
          className="List w-full h-full px-4 dark:bg-d-dark-gray rounded-xl"
          style={{
            overflowY: "auto",
            contain: "strict",
          }}
        >
          <div
            style={{
              height: virtualizer.getTotalSize(),
              width: "100%",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${items[0]?.start ?? 0}px)`,
              }}
            >
              {items.map((virtualRow) => (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                >
                  {itemRenderer(
                    virtualRow.index,
                    computedMessages[virtualRow.index]
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className={`w-full h-fit flex justify-center items-center absolute z-10 transition-all duration-200 ${
            isAtBottom
              ? "opacity-0 pointer-events-none bottom-0"
              : "opacity-100 bottom-2"
          }`}
        >
          <Tooltip title="Scroll to bottom" arrow placement="top">
            <button
              onClick={bottomClick}
              className="p-2 rounded-full text-xl text-teal bg-white-2 dark:bg-d-light-dark-gray hover:bg-light-gray dark:hover:bg-d-dark-gray transition-all duration-200 cursor-pointer"
            >
              <IoArrowDown />
            </button>
          </Tooltip>
        </div>
      </div>
      <ImageViewer
        data={imageUrls.map((image) => ({ url: image.url }))}
        open={open}
        setOpen={setOpen}
        index={index}
      />
    </div>
  );
}
