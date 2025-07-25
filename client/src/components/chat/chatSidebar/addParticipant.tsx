import { FormSubmitBtn, PrimaryBtn } from "@/components/ui/btns";
import { IoMdPersonAdd } from "react-icons/io";
import type React from "react";
import { useState } from "react";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import SearchContacts from "@/components/contact/searchContacts";
import type { Option } from "@/components/ui/multiSelectDropdown";
import { useForm } from "react-hook-form";
import { useSocketStore } from "@/stores/useSocketStore";
import { useSelectedContact } from "@/hooks/useSelectContact";

export default function AddParticipant(): React.ReactNode {
  const [show, setShow] = useState<boolean>(false);
  return (
    <>
      <PrimaryBtn onClick={() => setShow(!show)} isLoading={false}>
        <span className="flex items-center">
          <IoMdPersonAdd className="text-2xl" />
          <span className="ml-2">Add participant</span>
        </span>
      </PrimaryBtn>
      <Modal
        open={show}
        onClose={() => setShow(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="flex items-center justify-center h-fit min-h-full absolute max-sm:bg-pure-white"
      >
        <div className="w-full max-w-[28.75em] max-sm:max-w-full min-h-fit max-sm:min-h-screen p-10 rounded-lg max-sm:rounded-none bg-pure-white flex flex-col items-center max-sm:justify-center gap-3 relative">
          <span
            className="absolute hidden top-10 right-10 cursor-pointer text-xl font-extrabold w-10 h-10 max-sm:flex items-center justify-center bg-teal text-pure-white rounded-full"
            onClick={() => setShow(false)}
          >
            &#10005;
          </span>
          <h2 className="text-2xl font-semibold text-center">Add People</h2>
          <AddParticipantForm setOpen={setShow} />
        </div>
      </Modal>
    </>
  );
}

function AddParticipantForm({
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
