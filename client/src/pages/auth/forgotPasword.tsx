import ForgotPasswordForm from "@/components/auth/forgotPasswordForm";
import ForgotPasswordSuccess from "@/components/auth/forgotPasswordSuccess";
import ResetPasswordForm from "@/components/auth/resetPasswordForm";
import VerifyOtpForm from "@/components/auth/verifyOtpForm";
import type React from "react";
import { useState } from "react";

export default function ForgotPassword(): React.ReactNode {
  const [stage, setStage] = useState<number>(1);
  const [token, setToken] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  switch (stage) {
    case 1:
      return <ForgotPasswordForm setStage={setStage} setEmail={setEmail} />;
    case 2:
      return (
        <VerifyOtpForm email={email} setToken={setToken} setStage={setStage} />
      );
    case 3:
      return (
        <ResetPasswordForm email={email} token={token} setStage={setStage} />
      );
    case 4:
      return <ForgotPasswordSuccess />;
  }
}
