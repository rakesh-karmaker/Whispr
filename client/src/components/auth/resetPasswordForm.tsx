import { AuthForm } from "@/layouts/auth";
import { resetPassword } from "@/lib/api/auth";
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from "@/lib/zodSchemas/authSchema";

import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type React from "react";
import { useForm } from "react-hook-form";
import { FormSubmitBtn } from "@/components/ui/btns";
import { NavLink } from "react-router-dom";

export default function ResetPasswordForm({
  email,
  token,
  setStage,
}: {
  email: string;
  token: string;
  setStage: React.Dispatch<React.SetStateAction<number>>;
}): React.ReactNode {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const resetPasswordFormMutation = useMutation({
    mutationFn: (
      data: ResetPasswordSchema & { email: string; token: string }
    ) => resetPassword(data),
    onSuccess: () => {
      setStage(4);
    },
    onError: (err) => {
      const axiosError = err as AxiosError<{ subject?: string }>;
      const subject = axiosError.response?.data?.subject;
      if (subject === "password") {
        setError("confirmPassword", { message: "Passwords do not match" });
      } else {
        setError("confirmPassword", { message: "An unknown error occurred" });
      }
    },
  });

  function onSubmit(data: ResetPasswordSchema) {
    resetPasswordFormMutation.mutate({ ...data, email, token });
  }

  return (
    <AuthForm title="Set new password" subtitle="Enter your new password">
      <div className="flex flex-col gap-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 w-[29.0625em] items-center"
        >
          <div className="w-full flex flex-col gap-5">
            <TextField
              {...register("password")}
              type="password"
              label="Password"
              variant="outlined"
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <TextField
              {...register("confirmPassword")}
              type="password"
              label="Confirm Password"
              variant="outlined"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
            />
          </div>

          <FormSubmitBtn isLoading={resetPasswordFormMutation.isPending}>
            Reset Password
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
