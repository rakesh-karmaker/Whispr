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

  // Reset contacts when query changes (page reset is handled externally)
  useEffect(() => {
    setContacts([]);
    setHasMore(false); // This prevents the unwanted page increment
  }, [query]);

  useEffect(() => {
    // Don't fetch if no query
    if (!query.trim()) {
      setLoading(false);
      setContacts([]);
      setHasMore(false);
      return;
    }

    setLoading(true);
    setError(false);
    let cancel: Canceler = () => {};
    let debounceTimeout: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const data = await searchContacts(query, pageNumber, cancel);

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
        console.error(`Error fetching contacts for "${query}":`, err);
      } finally {
        setLoading(false);
      }
    };

    debounceTimeout = setTimeout(fetchData, query.length === 1 ? 150 : 300);

    return () => {
      clearTimeout(debounceTimeout);
      cancel();
    };
  }, [query, pageNumber]);

  return { loading, error, contacts, hasMore };
}
