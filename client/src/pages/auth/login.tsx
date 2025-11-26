import LoginForm from "@/components/forms/authForms/loginForm";
import { GoogleBtn } from "@/components/ui/btns";
import OrLine from "@/components/ui/orLineBreaker";
import useGoogleOAuth from "@/hooks/useGoogleOAuth";
import { AuthForm } from "@/layouts/authPageLayout";
import React from "react";
import { NavLink } from "react-router-dom";

export default function Login(): React.ReactElement {
  const { authFunc, isOAuthLoading } = useGoogleOAuth();

  return (
    <AuthForm
      title="Welcome back to Whispr"
      subtitle="Join Whispr and start connecting with your friends"
    >
      <LoginForm />

      <OrLine />

      <div className="w-[29.0625em]">
        <GoogleBtn signupWithGoogle={authFunc} isLoading={isOAuthLoading}>
          Don’t have an account?{" "}
          <NavLink
            to="/auth/register"
            className={"text-teal hover:text-gray transition-all duration-200"}
          >
            Sign up
          </NavLink>
        </GoogleBtn>
      </div>
    </AuthForm>
  );
}
