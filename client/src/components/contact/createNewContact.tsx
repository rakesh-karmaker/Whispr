import type React from "react";
import { useEffect, useState } from "react";
import type { Option } from "@/components/ui/multiSelectDropdown";
import SearchContacts from "./searchContacts";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createNewContact } from "@/lib/api/contacts";
import { useContacts } from "@/hooks/useContacts";
import { useSocketStore } from "@/stores/useSocketStore";

export default function CreateNewContact(): React.ReactNode {
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>("");
  const [open, setOpen] = useState<boolean>(true);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [selected, setSelected] = useState<Option[]>([]);
  const { contacts, setContacts } = useContacts();
  const socket = useSocketStore((s) => s.socket);

  const contactMutation = useMutation({
    mutationFn: (data: Option) => createNewContact(data),
    onSuccess: (res) => {
      if (res.chatId) {
        navigate(`/chat/${res.chatId}`);
      } else if (res.contactData) {
        if (socket) {
          socket.emit("add-contact", res.contactData);
        }
        setContacts([res.contactData, ...contacts]);
        setSelected([]);
      }
    },
    onError: (err) => {
      console.log(err);
    },
  });

  useEffect(() => {
    if (selected.length > 0) {
      contactMutation.mutate(selected[0]);
      setOpen(false);
      setSelected([]);
      setQuery("");
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
      open={open}
    >
      <div className="w-full flex relative items-center">
        <input
          type="text"
          name="contact-search"
          id="contact-search"
          placeholder="Search"
          className="w-full h-[44px] rounded-4xl border-[0.5px] border-light-gray pl-10 placeholder:text-gray text-sm outline-none"
          onChange={(e) => {
            setQuery(e.target.value);
            setPageNumber(1);
            setOpen(true);
          }}
          value={query}
        />
        <FaSearch className="absolute left-4 text-gray text-md" />
      </div>
    </SearchContacts>
  );
}
