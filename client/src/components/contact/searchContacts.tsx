import React, { useCallback, useRef } from "react";
import type { Option } from "@/components/ui/multiSelectDropdown";
import useContactSearch from "@/hooks/useContactSearch";
import MultiSelectDropdown from "@/components/ui/multiSelectDropdown";

type SearchContactsProps = {
  selected: Option[];
  setSelected: React.Dispatch<React.SetStateAction<Option[]>>;
  query: string;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  children: React.ReactNode;
  className?: string;
};

export default function SearchContacts({
  selected,
  setSelected,
  query,
  pageNumber,
  setPageNumber,
  children,
  className,
}: SearchContactsProps): React.ReactNode {
  const { contacts, loading, hasMore } = useContactSearch(query, pageNumber);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLButtonElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <>
      {children}
      <div className={className}>
        <MultiSelectDropdown
          data={contacts.filter(
            (contact) =>
              !selected.some((selected) => selected.id === contact._id)
          )}
          setSelected={setSelected}
          lastRef={lastElementRef}
          loading={loading}
        />
      </div>
    </>
  );
}
