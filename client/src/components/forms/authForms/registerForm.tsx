import TextField from "@mui/material/TextField";
import type React from "react";
import { FormSubmitBtn } from "@/components/ui/btns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { singUpSchema, type SingUpSchema } from "@/lib/zodSchemas/authSchema";
import { useMutation } from "@tanstack/react-query";
import { addTempUser } from "@/lib/api/auth";
import { useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";

type AddTempUserResponse = {
  message: string;
  id: string;
};

export default function RegisterForm(): React.ReactNode {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(singUpSchema),
  });

  const tempUserMutation = useMutation({
    mutationFn: (data: SingUpSchema) => addTempUser(data),
    onSuccess: (res: AddTempUserResponse) => {
      navigate("/auth/profile?id=" + res.id);
    },
    onError: (err) => {
      const axiosError = err as AxiosError<{ subject?: string }>;
      const subject = axiosError.response?.data?.subject;
      if (subject === "email") {
        setError("email", { message: "Email already exists" });
      } else if (subject === "password") {
        setError("confirmPassword", { message: "Passwords do not match" });
      } else {
        console.log(err);
      }
    },
  });

  function onSubmit(data: SingUpSchema) {
    tempUserMutation.mutate(data);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 w-[29.0625em] max-2xl:w-full max-2xl:max-w-[29.0625em] items-center"
    >
      <div className="flex flex-col gap-5 w-full">
        <TextField
          {...register("email")}
          id="email"
          label="Email"
          variant="outlined"
          error={!!errors.email}
          helperText={errors.email?.message}
          fullWidth
        />

        <TextField
          {...register("password")}
          id="password"
          label="Password"
          variant="outlined"
          type="password"
          error={!!errors.password}
          helperText={errors.password?.message}
          fullWidth
        />

        <TextField
          {...register("confirmPassword")}
          id="confirmPassword"
          label="Confirm Password"
          variant="outlined"
          type="password"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          fullWidth
        />
      </div>

      <FormSubmitBtn isLoading={tempUserMutation.isPending}>
        Continue
      </FormSubmitBtn>
    </form>
  );
}
