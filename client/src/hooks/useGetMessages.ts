import type { Canceler } from "axios";
import axios from "axios";
import { useEffect, useState } from "react";
import useMessages from "./useMessages";
import { getMessages } from "@/lib/api/messages";
import { useSelectedContact } from "./useSelectContact";

export default function useGetMessages(): {
  // pageNumber: number
  // setPageNumber: React.Dispatch<React.SetStateAction<number>>
  isLoading: boolean;
  error: boolean;
  // hasMore: boolean;
} {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  // const [hasMore, setHasMore] = useState<boolean>(true);
  const { setMessages } = useMessages();
  const { selectedContact } = useSelectedContact();

  useEffect(() => {
    setError(false);
    setIsLoading(true);
    setMessages([]);
    let cancel: Canceler = () => {};

    const fetchMessages = async () => {
      try {
        const data = await getMessages(selectedContact?._id || "", 1, cancel);

        // setMessages((prev) => {
        //   const allMessages = [...data.messages, ...prev];
        //   const uniqueMessages = Array.from(
        //     new Map(allMessages.map((msg) => [msg._id, msg])).values()
        //   );
        //   return uniqueMessages;
        // });
        setMessages(data.messages);

        // setHasMore(data.hasMore);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(true);
        console.error("Error fetching messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [selectedContact?._id]);

  return {
    isLoading,
    error,
    // hasMore,
  };
}
