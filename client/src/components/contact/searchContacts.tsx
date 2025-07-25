import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Option } from "@/components/ui/multiSelectDropdown";
import useContactSearch from "@/hooks/useContactSearch";
import MultiSelectDropdown from "@/components/ui/multiSelectDropdown";
import { useSelectedContact } from "@/hooks/useSelectContact";
import type { SearchedContact } from "@/types/contactTypes";

type SearchContactsProps = {
  selected: Option[];
  setSelected: React.Dispatch<React.SetStateAction<Option[]>>;
  query: string;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  children: React.ReactNode;
  className?: string;
  addPeople?: boolean;
  open?: boolean;
};

export default function SearchContacts({
  selected,
  setSelected,
  query,
  pageNumber,
  setPageNumber,
  children,
  className,
  addPeople = false,
  open = true,
}: SearchContactsProps): React.ReactNode {
  const { contacts, loading, hasMore } = useContactSearch(query, pageNumber);
  const { selectedContact } = useSelectedContact();
  const [uniqueContacts, setUniqueContacts] = useState<SearchedContact[]>([]);

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

  useEffect(() => {
    const uniqueContacts = contacts.filter((contact) => {
      if (addPeople && selectedContact) {
        const participants = selectedContact.admins
          ? [...selectedContact.admins, ...selectedContact.participants]
          : selectedContact.participants;

        return ![...participants, ...selected].some(
          (participant) => participant._id === contact._id
        );
      }

      return !selected.some((selected) => selected._id === contact._id);
    });

    setUniqueContacts(uniqueContacts);

    if (uniqueContacts.length === 0 && hasMore) {
      setPageNumber((prevPageNumber) => prevPageNumber + 1);
    }
  }, [selected, contacts, selectedContact]);

  return (
    <>
      {children}
      {open && (
        <div className={className}>
          <MultiSelectDropdown
            data={uniqueContacts}
            setSelected={setSelected}
            lastRef={lastElementRef}
            loading={loading}
          />
        </div>
      )}
    </>
  );
}
