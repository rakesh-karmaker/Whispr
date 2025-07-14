import type React from "react";
import { useEffect, useState } from "react";
import type { Option } from "@/components/ui/multiSelectDropdown";
import SearchContacts from "./searchContacts";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function CreateNewContact(): React.ReactNode {
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [selected, setSelected] = useState<Option[]>([]);

  useEffect(() => {
    if (selected.length > 0) {
      navigate(`/chat/${selected[0].id}`);
    }
  }, [selected]);

  return (
    <SearchContacts
      selected={selected}
      setSelected={setSelected}
      query={query}
      pageNumber={pageNumber}
      setPageNumber={setPageNumber}
      className="w-full h-fit absolute top-28 z-50"
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
