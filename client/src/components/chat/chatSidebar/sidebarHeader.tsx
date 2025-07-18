import { useSelectedContact } from "@/hooks/useSelectContact";
import Modal from "@mui/material/Modal";
import moment from "moment";
import type React from "react";
import { useState } from "react";
import { FaGear } from "react-icons/fa6";
import ImageInput from "@/components/ui/imageInput";
import TextField from "@mui/material/TextField";
import { FormSubmitBtn } from "@/components/ui/btns";
import { useFieldArray, useForm } from "react-hook-form";
import {
  updateGroupFormSchema,
  type UpdateGroupFormSchema,
} from "@/lib/zodSchemas/contactSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { updateGroup } from "@/lib/api/contacts";
import { useSocketStore } from "@/stores/useSocketStore";
import { useContacts } from "@/hooks/useContacts";
import Select from "@mui/material/Select";
import { allowedSocialTypes } from "@/services/data";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { RxCross2 } from "react-icons/rx";
import { usePreferences } from "@/hooks/usePreferences";

export default function SidebarHeader(): React.ReactNode {
  {
    const { selectedContact } = useSelectedContact();
    const [open, setOpen] = useState<boolean>(false);
    const { setIsSidebarOpen } = usePreferences();

    return (
      <div className="w-full flex justify-between items-center gap-3.5">
        <button
          className="hidden max-sm:flex cursor-pointer text-xl text-gray hover:text-black transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        >
          <RxCross2 />
        </button>
        <p className="text-gray font-medium">
          {moment().format("DD MMM YYYY")}
        </p>
        {selectedContact.isGroup && (
          <>
            <button
              type="button"
              aria-label="open chat settings"
              onClick={() => setOpen(true)}
              className="text-gray hover:text-black transition-all duration-300 cursor-pointer text-lg"
            >
              <FaGear />
            </button>
            <Modal
              open={open}
              onClose={() => setOpen(false)}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
              className="flex items-center justify-center h-fit min-h-full absolute max-sm:bg-pure-white"
            >
              <div className="w-full max-w-[38.75em] max-sm:max-w-full min-h-fit max-sm:min-h-screen p-10 rounded-lg max-sm:rounded-none bg-pure-white flex flex-col items-center max-sm:justify-center gap-3 relative">
                <span
                  className="absolute hidden top-10 right-10 cursor-pointer text-xl font-extrabold w-10 h-10 max-sm:flex items-center justify-center bg-teal text-pure-white rounded-full"
                  onClick={() => setOpen(false)}
                >
                  &#10005;
                </span>
                <h2 className="text-2xl font-semibold text-center">
                  Change group info
                </h2>
                <UpdateGroupForm setOpen={setOpen} />
              </div>
            </Modal>
          </>
        )}
      </div>
    );
  }

  function UpdateGroupForm({
    setOpen,
  }: {
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) {
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
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="w-full h-full flex gap-1 items-center max-sm:flex-col"
                >
                  <div className="w-[40%] flex justify-between max-sm:w-full items-center">
                    <FormControl className="w-full max-sm:w-[40%]">
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

                    <button
                      className="hidden min-w-10 min-h-10 max-h-10 max-w-10 max-sm:flex items-center justify-center bg-white-2 text-red rounded-full text-xl hover:bg-red hover:text-pure-white transition-all duration-200 cursor-pointer"
                      onClick={() => remove(index)}
                      type="button"
                      aria-label="Remove social link"
                    >
                      <RxCross2 />
                    </button>
                  </div>

                  <TextField
                    {...register(`socials.${index}.link`)}
                    label="Link"
                    variant="outlined"
                    error={!!errors.socials?.[index]?.link}
                    helperText={errors.socials?.[index]?.link?.message}
                    className="w-full"
                  />

                  <button
                    className="max-sm:hidden min-w-10 min-h-10 max-h-10 max-w-10 flex items-center justify-center bg-white-2 text-red rounded-full text-xl hover:bg-red hover:text-pure-white transition-all duration-200 cursor-pointer"
                    onClick={() => remove(index)}
                    type="button"
                    aria-label="Remove social link"
                  >
                    <RxCross2 />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full flex flex-col gap-1.5 justify-center">
            <div className="w-full flex items-center justify-center gap-2 max-sm:flex-col-reverse">
              <FormSubmitBtn isLoading={updateGroupMutation.isPending}>
                Save
              </FormSubmitBtn>
              <button
                type="button"
                onClick={() => append({ type: "", link: "" })}
                className="w-full h-fit bg-white-3 text-black transition-all duration-300 text-xl max-lg:text-lg font-medium p-3 max-lg:py-3 py-4 rounded-4xl cursor-pointer"
              >
                Add
              </button>
            </div>
            {errors.root && (
              <p className="text-red-500">{errors.root.message}</p>
            )}
          </div>
        </form>
      </>
    );
  }
}
