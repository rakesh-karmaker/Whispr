import type React from "react";
import { FormSubmitBtn } from "../ui/btns";
import { AuthForm } from "@/layouts/auth";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { sendForgotPasswordEmail, verifyOtp } from "@/lib/api/auth";
import type { AxiosError } from "axios";
import { NavLink } from "react-router-dom";

export default function VerifyOtpForm({
  email,
  setToken,
  setStage,
}: {
  email: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  setStage: React.Dispatch<React.SetStateAction<number>>;
}): React.ReactNode {
  const [otp, setOtp] = useState(new Array(5).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const tokenMutation = useMutation({
    mutationFn: (data: { email: string; otp: string }) =>
      verifyOtp(data.email, data.otp),
    onSuccess: (res) => {
      setError(null);
      setToken(res.token);
      setStage(3);
    },
    onError: (err) => {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(
        axiosError.response?.data?.message ?? "An unknown error occurred"
      );
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { value, maxLength } = e.target;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to the next input field if the current one is filled
    if (value.length >= maxLength) {
      const nextInput = e.target.nextElementSibling;
      if (nextInput && nextInput.tagName === "INPUT") {
        (nextInput as HTMLInputElement).focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text");
    if (paste.length === otp.length) {
      const newOtp = paste.split("");
      setOtp(newOtp);
      // Move focus to the last input field
      const input = e.target as HTMLInputElement;
      const lastInput = input.form?.elements[otp.length - 1] as
        | HTMLInputElement
        | undefined;
      lastInput?.focus();
    }
    e.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    const otpNumber = otp.join("");

    tokenMutation.mutate({
      email,
      otp: otpNumber,
    });

    e.preventDefault();
  };

  const resend = async () => {
    setLoading(true);
    await sendForgotPasswordEmail({ email });
    setLoading(false);
    // if (res.status === 200) {
    //   toast.success(res.data.message);
    // } else {
    //   toast.error(res.data.message);
    // }
  };

  return (
    <AuthForm title="Verify OTP" subtitle={`We have sent an OTP to ${email}`}>
      <div className="flex flex-col gap-3">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 w-[29.0625em] items-center"
        >
          <div className="w-full">
            <div className="w-full flex gap-2.5 justify-between">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  value={data}
                  onChange={(e) => handleChange(e, index)}
                  onPaste={index === 0 ? handlePaste : undefined} // Attach onPaste to the first input
                  className="w-[2.5em] h-[2.5em] text-center border border-[#00000049] rounded-[5px] text-[2em]/[140%] font-semibold outline-none"
                  maxLength={1}
                />
              ))}
            </div>
            {error && <p className="text-red-600 font-medium">{error}</p>}
          </div>

          <FormSubmitBtn isLoading={tokenMutation.isPending}>
            Continue
          </FormSubmitBtn>

          <div className="text-center font-medium text-gray flex gap-2">
            <p>Didn't receive the OTP?</p>
            <button
              type="button"
              onClick={resend}
              disabled={loading}
              className="text-teal border-none bg-none cursor-pointer"
            >
              {loading ? "Sending..." : "Resend"}
            </button>
          </div>
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
