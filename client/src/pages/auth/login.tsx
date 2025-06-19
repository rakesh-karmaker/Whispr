import GoogleBtn from "@/components/auth/googleBtn";
import LoginForm from "@/components/auth/loginForm";
import OrLine from "@/components/ui/orLineBreaker";
import useGoogleOAuth from "@/hooks/useGoogleOAuth";
import { AuthForm } from "@/layouts/auth";
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

      <GoogleBtn signupWithGoogle={authFunc} isLoading={isOAuthLoading}>
        Don’t have an account?{" "}
        <NavLink to="/auth/register" className={"text-teal"}>
          Sign up
        </NavLink>
      </GoogleBtn>
    </AuthForm>
  );
}
