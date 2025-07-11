import type React from "react";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import type { Option } from "@/components/ui/multiSelectDropdown";
import SearchContacts from "./searchContacts";

export default function CreateNewContact(): React.ReactNode {
  const [query, setQuery] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [selected, setSelected] = useState<Option[]>([]);

  return (
    <SearchContacts
      selected={selected}
      setSelected={setSelected}
      query={query}
      pageNumber={pageNumber}
      setPageNumber={setPageNumber}
      className="w-full h-fit absolute top-28"
    >
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
    </SearchContacts>
  );
}
