import Modal from "@mui/material/Modal";
import type React from "react";
import { useState } from "react";
import { GoPlus } from "react-icons/go";
import ImageInput from "../ui/imageInput";
import { useForm } from "react-hook-form";
import {
  createGroupFormSchema,
  type CreateGroupFormSchema,
} from "@/lib/zodSchemas/contactSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import type { Option } from "../ui/multiSelectDropdown";
import SearchContacts from "./searchContacts";
import Autocomplete from "@mui/material/Autocomplete";
import { FormSubmitBtn } from "../ui/btns";

export default function CreateGroup(): React.ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="w-[51px] h-[51px] rounded-full bg-teal border-none outline-none flex items-center justify-center cursor-pointer text-pure-white transition-all duration-300 hover:bg-white-2 hover:text-black"
        onClick={() => setOpen(true)}
      >
        <GoPlus className="text-4xl" />
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="flex items-center justify-center h-fit min-h-full absolute max-sm:bg-pure-white"
      >
        <div className="w-full max-w-[28.75em] max-sm:max-w-full min-h-fit max-sm:min-h-screen p-10 rounded-lg max-sm:rounded-none bg-pure-white flex flex-col items-center max-sm:justify-center gap-3 relative">
          <span
            className="absolute hidden top-10 right-10 cursor-pointer text-xl font-extrabold w-10 h-10 max-sm:flex items-center justify-center bg-teal text-pure-white rounded-full"
            onClick={() => setOpen(false)}
          >
            &#10005;
          </span>
          <h2 className="text-2xl font-semibold text-center">
            Create a new group
          </h2>
          <CreateGroupForm />
        </div>
      </Modal>
    </>
  );
}

function CreateGroupForm(): React.ReactNode {
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [selected, setSelected] = useState<Option[]>([]);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      name: "",
      groupImage: "",
    },
  });

  function onSubmit(data: CreateGroupFormSchema) {
    if (!data.groupImage || data.groupImage.length == 0) {
      setError("groupImage", { message: "Image is required" });
      return;
    }

    console.log(data);
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full h-full flex flex-col gap-8 items-center"
      >
        <ImageInput
          register={{ ...register("groupImage") }}
          errorMessage={errors.groupImage?.message as string}
        />

        <div className="w-full flex flex-col gap-5 items-center">
          <TextField
            {...register("name")}
            label="Group Name"
            variant="outlined"
            error={!!errors.name}
            helperText={errors.name?.message}
            className="w-full"
          />

          <div className={`w-full relative`}>
            <SearchContacts
              selected={selected}
              setSelected={setSelected}
              query={query}
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
              className="w-full h-fit absolute z-40"
            >
              <Autocomplete
                multiple
                id="tags-outlined"
                options={[]}
                value={selected}
                onChange={(e, value: Option[]) => setSelected(value)}
                getOptionLabel={(option: Option) => option.firstName}
                open={false}
                filterSelectedOptions
                className="w-full flex relative items-center"
                onFocus={() => setQuery("")}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search"
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

        <div className="w-full flex justify-center">
          <FormSubmitBtn isLoading={false}>Create Group</FormSubmitBtn>
        </div>
      </form>
    </>
  );
}
