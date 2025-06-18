import type { GetTempUserResponse } from "@/pages/auth/profile";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import {
  authProfileSchema,
  type AuthProfileSchema,
} from "@/lib/zodSchemas/authSchema";
import { useForm } from "react-hook-form";
import ImageInput from "../ui/imageInput";
import TextField from "@mui/material/TextField";
import { FormSubmitBtn } from "../ui/btns";

export default function AuthProfileFrom({
  user,
  id,
}: {
  user: GetTempUserResponse;
  id: string;
}): React.ReactNode {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(authProfileSchema),
    defaultValues: {
      email: user.email,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      avatar: user.avatar || "",
    },
  });

  function onSubmit(data: AuthProfileSchema) {
    if (!data.avatar || data.avatar.length == 0) {
      setError("avatar", { message: "Image is required" });
      return;
    }
    console.log(data);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-8 w-[29.0625em] items-center"
    >
      <ImageInput
        register={{ ...register("avatar") }}
        errorMessage={errors.avatar?.message as string}
        image={user?.avatar}
      />

      <div className="w-full flex flex-col gap-6 items-center">
        <div className="flex flex-col gap-5 w-full">
          <TextField
            {...register("email")}
            label="Email"
            variant="outlined"
            error={!!errors.email}
            helperText={errors.email?.message as string}
            fullWidth
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />

          <TextField
            {...register("firstName")}
            label="First Name"
            variant="outlined"
            error={!!errors.firstName}
            helperText={errors.firstName?.message as string}
            fullWidth
          />

          <TextField
            {...register("lastName")}
            label="Last Name"
            variant="outlined"
            error={!!errors.lastName}
            helperText={errors.lastName?.message as string}
            fullWidth
          />
        </div>

        <FormSubmitBtn isLoading={false}>Save</FormSubmitBtn>
      </div>
    </form>
  );
}
