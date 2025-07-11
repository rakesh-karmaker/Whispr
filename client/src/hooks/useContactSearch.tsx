import { searchContacts } from "@/lib/api/contacts";
import type { Canceler } from "axios";
import axios from "axios";
import { useEffect, useState } from "react";
import type { SearchedContact } from "@/types/contactTypes";

export default function useContactSearch(
  query: string,
  pageNumber: number
): {
  loading: boolean;
  error: boolean;
  contacts: SearchedContact[];
  hasMore: boolean;
} {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [contacts, setContacts] = useState<SearchedContact[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);

  useEffect(() => {
    setContacts([]); // Reset contacts when query changes
  }, [query]);

  useEffect(() => {
    setLoading(true);
    setError(false);
    let cancel: Canceler = () => {};
    let debounceTimeout: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const data = await searchContacts(query, pageNumber, cancel);
        console.log(data);
        setContacts((prevContacts) => {
          const all = [...prevContacts, ...data.contacts];
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
        setLoading(false);
      }
    };

    if (query) {
      debounceTimeout = setTimeout(fetchData, 300); // 300ms debounce
    } else {
      setLoading(false);
    }

    return () => {
      clearTimeout(debounceTimeout);
      cancel();
    };
  }, [query, pageNumber]);

  return { loading, error, contacts, hasMore };
}
