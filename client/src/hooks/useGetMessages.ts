import type { Canceler } from "axios";
import axios from "axios";
import React, { useEffect, useState } from "react";
import useMessages from "./useMessages";
import { getMessages } from "@/lib/api/contacts";
import { useSelectedContact } from "./useSelectContact";

export default function useGetMessages(
  pageNumber: number
  // setPageNumber: React.Dispatch<React.SetStateAction<number>>
): {
  isLoading: boolean;
  error: boolean;
  hasMore: boolean;
} {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { setMessages } = useMessages();
  const { selectedContact } = useSelectedContact();

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    let cancel: Canceler = () => {};

    const fetchMessages = async () => {
      try {
        const data = await getMessages(selectedContact._id, pageNumber, cancel);

        setMessages((prev) => {
          const allMessages = [...data.messages, ...prev];
          const uniqueMessages = Array.from(
            new Map(allMessages.map((msg) => [msg._id, msg])).values()
          );
          return uniqueMessages;
        });

        setHasMore(data.hasMore);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(true);
        console.error("Error fetching messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (hasMore && selectedContact?._id) {
      fetchMessages();
    }
  }, [pageNumber]);

  useEffect(() => {
    // Reset messages when the selected contact changes
    setMessages([]);
    setHasMore(true);
  }, [selectedContact?._id]);

  return {
    isLoading,
    error,
    hasMore,
  };
}
