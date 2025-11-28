import AddedPeopleList from "../ui/addedPeopleList";
import ImageInput from "@/components/ui/imageInput";
import { useForm } from "react-hook-form";
import {
  createGroupFormSchema,
  type CreateGroupFormSchema,
} from "@/lib/zodSchemas/contactSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import type { Option } from "@/components/ui/multiSelectDropdown";
import Autocomplete from "@mui/material/Autocomplete";
import { FormSubmitBtn } from "@/components/ui/btns";
import { useMutation } from "@tanstack/react-query";
import type { CreateNewGroupMutationProps } from "@/types/contactTypes";
import { createNewGroup } from "@/lib/api/contacts";
import { useContacts } from "@/hooks/useContacts";
import { useSocketStore } from "@/stores/useSocketStore";
import { useState } from "react";
import SearchContacts from "../contact/searchContacts";

export default function CreateGroupForm({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}): React.ReactNode {
  const navigate = useNavigate();

  const [query, setQuery] = useState<string>("");
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [selected, setSelected] = useState<Option[]>([]);
  const { setContacts } = useContacts();
  const socket = useSocketStore((e) => e.socket);

  const createGroupMutation = useMutation({
    mutationFn: (data: CreateNewGroupMutationProps) => createNewGroup(data),
    onSuccess: (res) => {
      if (res.groupData) {
        if (socket) {
          socket.emit("add-contact", res.groupData);
        }
        setContacts((prev) => [res.groupData, ...prev]);
        navigate(`/chat/${res.groupData._id.toString()}`);
        setOpen(false);
      }
    },
  });

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

    if (selected.length === 0) {
      setError("root", {
        message: "At least one contact is required",
      });
      return;
    }

    createGroupMutation.mutate({
      name: data.name,
      groupImage: data.groupImage,
      selectedUsers: selected,
    });
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full h-full flex flex-col gap-4 items-center"
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
            autoComplete="off"
          />

          <div className={`w-full relative`}>
            <SearchContacts
              selected={selected}
              setSelected={setSelected}
              query={query}
              pageNumber={pageNumber}
              setPageNumber={setPageNumber}
              className="w-full h-fit absolute max-h-100 z-40"
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
                    label="Search people to add"
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

        <AddedPeopleList selected={selected} setSelected={setSelected} />

        <div className="w-full flex flex-col gap-1.5 justify-center">
          <FormSubmitBtn isLoading={createGroupMutation.isPending}>
            Create Group
          </FormSubmitBtn>
          {errors.root && <p className="text-red-500">{errors.root.message}</p>}
        </div>
      </form>
    </>
  );
}
