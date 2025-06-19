import ForgotPasswordForm from "@/components/auth/forgotPasswordForm";
import type React from "react";
import { useState } from "react";

export default function ForgotPassword(): React.ReactNode {
  const [stage, setStage] = useState<number>(1);
  const [token, setToken] = useState<string>("");
  const [email, setEmail] = useState<string>("");

  switch (stage) {
    case 1:
      return <ForgotPasswordForm setStage={setStage} setEmail={setEmail} />;
  }
}
