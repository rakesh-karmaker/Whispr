import type React from "react";
import { useCallback, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import type { Option } from "@/components/ui/multiSelectDropdown";
import useContactSearch from "@/hooks/useContactSearch";
import MultiSelectDropdown from "@/components/ui/multiSelectDropdown";

export default function CreateNewContact(): React.ReactNode {
  const [query, setQuery] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [selected, setSelected] = useState<Option[]>([]);
  const { contacts, loading, hasMore } = useContactSearch(query, pageNumber);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLButtonElement) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        // Intersection logic here
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
      <div className="w-full max-w-[22.0625em] flex relative items-center">
        <input
          type="text"
          name="contact-search"
          id="contact-search"
          placeholder="Search"
          className="w-full h-[51px] rounded-4xl border-[0.5px] border-light-gray pl-10 placeholder:text-gray text-[1em] outline-none"
          onChange={(e) => {
            setQuery(e.target.value);
            setPageNumber(1);
          }}
        />
        <FaSearch className="absolute left-4 text-dark-gray" />
      </div>
      <div className="w-full max-w-[28.75em] h-fit absolute top-32">
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
