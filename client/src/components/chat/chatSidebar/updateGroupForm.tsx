import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import { FormSubmitBtn } from "@/components/ui/btns";
import ImageInput from "@/components/ui/imageInput";
import {
  updateGroupFormSchema,
  type UpdateGroupFormSchema,
} from "@/lib/zodSchemas/contactSchema";
import { useMutation } from "@tanstack/react-query";
import { updateGroup } from "@/lib/api/contacts";
import { useSocketStore } from "@/stores/useSocketStore";
import { useContacts } from "@/hooks/useContacts";
import { useSelectedContact } from "@/hooks/useSelectContact";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { allowedSocialTypes } from "@/services/data";
import { RxCross2 } from "react-icons/rx";
import { FaPlus } from "react-icons/fa6";
import type { Socket } from "socket.io-client";
import Tooltip from "@mui/material/Tooltip";
import DeleteGroupWarning from "./deleteGroupWarning";

export default function UpdateGroupForm({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [warningOpen, setWarningOpen] = useState<boolean>(false);
  const socket = useSocketStore((s) => s.socket);
  const { selectedContact, setSelectedContact } = useSelectedContact();
  const { setContacts, setPinnedContacts } = useContacts();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<UpdateGroupFormSchema>({
    resolver: zodResolver(updateGroupFormSchema),
    defaultValues: {
      name: selectedContact.name,
      groupImage: selectedContact.image,
      socials:
        selectedContact.socialLinks.length === 0
          ? [{ type: "", link: "" }]
          : selectedContact.socialLinks,
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: (data: UpdateGroupFormSchema) => {
      const reqData = { ...data, chatId: selectedContact._id };
      return updateGroup(reqData);
    },
    onSuccess: (res) => {
      if (res.updatedContact) {
        setSelectedContact({ ...selectedContact, ...res.updatedContact });
        setContacts((prevContacts) => {
          const updatedContacts = prevContacts.map((contact) => {
            if (contact._id === res.updatedContact._id) {
              return {
                ...contact,
                lastMessages: [
                  ...contact.lastMessages,
                  res.updatedContact.updatedMessage,
                ],
                contactName: res.updatedContact.name,
                contactImage: res.updatedContact.image,
              };
            }
            return contact;
          });
          return updatedContacts;
        });

        setPinnedContacts((prevPinnedContacts) => {
          const updatedPinnedContacts = prevPinnedContacts.map((contact) => {
            if (contact._id === res.updatedContact._id) {
              return {
                ...contact,
                lastMessages: [
                  ...contact.lastMessages,
                  res.updatedContact.updatedMessage,
                ],
                contactName: res.updatedContact.name,
                contactImage: res.updatedContact.image,
              };
            }
            return contact;
          });
          return updatedPinnedContacts;
        });

        if (socket) {
          socket.emit("update-group", res.updatedContact);
        }
      }
    },
    onError: (err) => {
      console.log(err);
    },
    onSettled: () => {
      setOpen(false);
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socials",
  });

  const onSubmit = (data: UpdateGroupFormSchema) => {
    if (!data.groupImage || data.groupImage.length == 0) {
      setError("groupImage", { message: "Image is required" });
      return;
    }

    updateGroupMutation.mutate(data);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full h-full flex flex-col gap-8 items-center"
      >
        <ImageInput
          register={{ ...register("groupImage") }}
          errorMessage={errors.groupImage?.message as string}
          image={selectedContact.image}
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

          <div className="w-full h-full flex flex-col gap-3">
            {fields.length === 0 && (
              <div className="w-full flex items-center justify-between flex-wrap gap-3">
                <p className="text-gray text-sm">
                  Add social links to allow members to connect with the group
                </p>
                <AddSocialLinkButton append={append} />
              </div>
            )}
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="w-full h-full flex gap-1 items-center max-sm:flex-col"
              >
                <div className="w-[40%] flex justify-between max-sm:w-full max-sm:gap-3 items-center">
                  <FormControl className="w-full max-sm:w-1/2 max-xs:w-full">
                    <InputLabel id="type-label">Type</InputLabel>

                    <Select
                      {...register(`socials.${index}.type`)}
                      labelId="type-label"
                      variant="outlined"
                      label="Type"
                      error={!!errors.socials?.[index]?.type}
                      defaultValue={field.type}
                    >
                      {allowedSocialTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type[0].toUpperCase() + type.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <div className="hidden gap-1 max-sm:flex">
                    <RemoveSocialLinkButton remove={remove} index={index} />
                    {index == fields.length - 1 && (
                      <AddSocialLinkButton append={append} />
                    )}
                  </div>
                </div>

                <TextField
                  {...register(`socials.${index}.link`)}
                  label="Link"
                  variant="outlined"
                  error={!!errors.socials?.[index]?.link}
                  helperText={errors.socials?.[index]?.link?.message}
                  className="w-full"
                />

                <div className="flex gap-1 max-sm:hidden">
                  <RemoveSocialLinkButton remove={remove} index={index} />
                  {index == fields.length - 1 && (
                    <AddSocialLinkButton append={append} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex flex-col gap-1.5 justify-center">
            <div className="w-full flex items-center justify-center gap-2 max-sm:flex-col-reverse">
              <FormSubmitBtn isLoading={updateGroupMutation.isPending}>
                Save
              </FormSubmitBtn>
              <button
                type="button"
                onClick={() => setWarningOpen(true)}
                className="w-full h-fit bg-red text-pure-white transition-all duration-300 text-xl max-lg:text-lg font-medium p-3 max-lg:py-3 py-4 rounded-4xl cursor-pointer hover:bg-gray hover:text-pure-white"
              >
                Delete Group
              </button>
            </div>
            {errors.root && (
              <p className="text-red-500">{errors.root.message}</p>
            )}
          </div>
        </div>
      </form>
      <DeleteGroupWarning
        warningOpen={warningOpen}
        setWarningOpen={setWarningOpen}
        selectedContact={selectedContact}
        socket={socket as Socket}
        setOpen={setOpen}
      />
    </>
  );
}

function AddSocialLinkButton({
  append,
}: {
  append: (value: { type: string; link: string }) => void;
}) {
  return (
    <Tooltip title="Add social link" arrow placement="top">
      <button
        className={`min-w-10 min-h-10 max-h-10 max-w-10 flex items-center justify-center bg-white-2 dark:bg-d-light-dark-gray text-teal rounded-full text-xl hover:bg-teal hover:text-pure-white transition-all duration-200 cursor-pointer`}
        onClick={() => append({ type: "", link: "" })}
        type="button"
        aria-label="Add social link"
      >
        <FaPlus />
      </button>
    </Tooltip>
  );
}

function RemoveSocialLinkButton({
  remove,
  index,
}: {
  remove: (index: number) => void;
  index: number;
}) {
  return (
    <Tooltip title="Remove social link" arrow placement="top">
      <button
        className={`min-w-10 min-h-10 max-h-10 max-w-10 flex items-center justify-center bg-white-2 dark:bg-d-light-dark-gray text-red rounded-full text-xl hover:bg-red hover:text-pure-white transition-all duration-200 cursor-pointer`}
        onClick={() => remove(index)}
        type="button"
        aria-label="Remove social link"
      >
        <RxCross2 />
      </button>
    </Tooltip>
  );
}
