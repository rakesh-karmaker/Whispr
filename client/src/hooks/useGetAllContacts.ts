import { getAllContacts } from "@/lib/api/contacts";
import type { Canceler } from "axios";
import axios from "axios";
import { useEffect, useState } from "react";
import { useContacts } from "./useContacts";

export default function useGetAllContacts(pageNumber: number): {
  isLoading: boolean;
  error: boolean;
  hasMore: boolean;
} {
  const { setContacts, setPinnedContacts, isLoading, setIsLoading } =
    useContacts();
  const [error, setError] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    setError(false);
    let cancel: Canceler = () => {};

    const fetchData = async () => {
      try {
        const data = await getAllContacts(pageNumber, cancel);

        if (pageNumber == 1 && data.pinnedContacts) {
          setPinnedContacts(data.pinnedContacts);
        }

        setContacts((prev) => {
          const all = [...prev, ...data.contacts];
          const unique = Array.from(
            new Map(all.map((item) => [item._id, item])).values()
          );
          return unique;
        });

        setHasMore(data.hasMore);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(true);
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancel();
    };
  }, [pageNumber]);

  return { isLoading, error, hasMore };
}
