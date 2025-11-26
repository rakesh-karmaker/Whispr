import Autocomplete from "@mui/material/Autocomplete";
import SearchContacts from "../contact/searchContacts";
import type { Option } from "../ui/multiSelectDropdown";
import TextField from "@mui/material/TextField";
import { FormSubmitBtn } from "../ui/btns";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useSelectedContact } from "@/hooks/useSelectContact";
import { useSocketStore } from "@/stores/useSocketStore";

export default function AddParticipantForm({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}): React.ReactNode {
  const [query, setQuery] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [selected, setSelected] = useState<Option[]>([]);
  const socket = useSocketStore((e) => e.socket);
  const { selectedContact } = useSelectedContact();

  const {
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  function onSubmit() {
    if (selected.length === 0) {
      setError("root", {
        message: "At least one contact is required",
      });
      return;
    }

    if (socket) {
      socket.emit("add-participants", {
        participants: selected,
        contactId: selectedContact._id,
      });
    }
    setOpen(false);
    if (selected.length > 0) {
      setSelected([]);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full h-full flex flex-col gap-8 items-center"
      >
        <div className="w-full flex flex-col gap-5 items-center">
          <div className={`w-full relative`}>
            <SearchContacts
              selected={selected}
              setSelected={setSelected}
              query={query}
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
              addPeople={true}
              className="w-full h-fit absolute z-40"
            >
              <Autocomplete
                multiple
                id="tags-outlined"
                options={[]}
                value={selected}
                onChange={(e, value: Option[]) => {
                  setSelected(value);
                  setPageNumber(1);
                  setQuery("");
                  e.preventDefault();
                }}
                getOptionLabel={(option: Option) =>
                  option.firstName || option.name
                }
                open={false}
                filterSelectedOptions
                className="w-full flex relative items-center"
                onFocus={() => setQuery("")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Contacts"
                    className="w-full flex relative items-center"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPageNumber(1);
                    }}
                  />
                )}
              />
            </SearchContacts>
          </div>
        </div>

        <div className="w-full flex flex-col gap-1.5 justify-center">
          <FormSubmitBtn isLoading={false}>Add People</FormSubmitBtn>
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}
        </div>
      </form>
    </>
  );
}
