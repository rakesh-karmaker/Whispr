import { loginUser } from "@/lib/api/auth";
import { loginSchema, type LoginSchema } from "@/lib/zodSchemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import TextField from "@mui/material/TextField";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import type React from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import { FormSubmitBtn } from "@/components/ui/btns";
import type { UserType } from "@/types/authTypes";
import { useUser } from "@/hooks/useUser";

export default function LoginForm(): React.ReactNode {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const userMutation = useMutation({
    mutationFn: (data: LoginSchema) => loginUser(data),
    onSuccess: (data: UserType) => {
      setUser(data);
      navigate("/chat", { replace: true });
    },
    onError: (err) => {
      const axiosError = err as AxiosError<{ subject?: string }>;
      const subject = axiosError.response?.data?.subject;
      if (subject == "password" || subject == "email") {
        setError("root", {
          message: "Invalid Credentials",
        });
      } else if (subject == "noPassword") {
        setError("root", {
          message: "This email is registered with Google",
        });
      } else {
        console.log(err);
      }
    },
  });

  function onSubmit(data: LoginSchema) {
    userMutation.mutate(data);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 w-[29.0625em] max-2xl:w-full max-2xl:max-w-[29.0625em] items-center"
    >
      <div className="flex flex-col gap-2 w-full">
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
        </div>

        <NavLink
          to={"/auth/forgot-password"}
          className="text-teal w-fit hover:text-gray transition-all duration-200"
        >
          Forgot password?
        </NavLink>

        {errors.root ? (
          <p className="text-red-500 font-medium">{errors.root?.message}</p>
        ) : null}
      </div>

      <FormSubmitBtn isLoading={userMutation.isPending}>Log in</FormSubmitBtn>
    </form>
  );
}
