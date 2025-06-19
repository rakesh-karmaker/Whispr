import { AuthForm } from "@/layouts/auth";
import { SendForgotPasswordEmail } from "@/lib/api/auth";
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormSchema,
} from "@/lib/zodSchemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type React from "react";
import { useForm } from "react-hook-form";
import { FormSubmitBtn } from "../ui/btns";
import { NavLink } from "react-router-dom";

export default function ForgotPasswordForm({
  setStage,
  setEmail,
}: {
  setStage: React.Dispatch<React.SetStateAction<number>>;
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}): React.ReactNode {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(forgotPasswordFormSchema),
  });

  const forgotPasswordFormMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormSchema) =>
      SendForgotPasswordEmail(data),
    onSuccess: (res) => {
      setEmail(res.email);
      setStage(2);
    },
    onError: (err) => {
      const axiosError = err as AxiosError<{ subject?: string }>;
      const subject = axiosError.response?.data?.subject;
      if (subject === "email") {
        setError("email", { message: "Email does not exist" });
      } else {
        console.log(err);
      }
    },
  });

  function onSubmit(data: ForgotPasswordFormSchema) {
    forgotPasswordFormMutation.mutate(data);
  }

  return (
    <AuthForm
      title="Forgot password"
      subtitle="Enter your email and we will send you an OTP to reset your password"
    >
      <div className="flex flex-col gap-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 w-[29.0625em] items-center"
        >
          <TextField
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
            label="Email"
            variant="outlined"
            className="w-full"
          />

          <FormSubmitBtn isLoading={forgotPasswordFormMutation.isPending}>
            Send OTP
          </FormSubmitBtn>
        </form>

        <p className="text-center font-medium text-gray">
          Back to{" "}
          <NavLink to="/auth/login" className={"text-teal"}>
            Log in
          </NavLink>
        </p>
      </div>
    </AuthForm>
  );
}
