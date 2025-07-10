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
    setLoading(true);
    setError(false);
    let cancel: Canceler = () => {};

    const fetchData = async () => {
      try {
        const data = await searchContacts(query, pageNumber, cancel);
        setContacts((prevContacts) => [
          ...new Set([...prevContacts, ...data.contacts]),
        ]);
        setHasMore(data.hasMore);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(true);
        console.log(err);
      }
    };

    fetchData();
    setLoading(false);
    return () => cancel();
  }, [query, pageNumber]);

  return { loading, error, contacts, hasMore };
}
