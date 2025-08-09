import { AuthForm } from "@/layouts/authPageLayout";
import type React from "react";
import RegisterForm from "@/components/auth/registerForm";
import OrLine from "@/components/ui/orLineBreaker";
import useGoogleOAuth from "@/hooks/useGoogleOAuth";
import GoogleBtn from "@/components/auth/googleBtn";
import { NavLink } from "react-router-dom";

export default function Register(): React.ReactNode {
  const { authFunc, isOAuthLoading } = useGoogleOAuth();

  return (
    <div className="flex flex-col gap-7">
      <AuthForm
        title="Create your account"
        subtitle="Join Whispr and start connecting with your friends"
      >
        <RegisterForm />
      </AuthForm>

      <OrLine />

      <div className="w-[29.0625em]">
        <GoogleBtn signupWithGoogle={authFunc} isLoading={isOAuthLoading}>
          Already have an account?{" "}
          <NavLink
            to="/auth/login"
            className={"text-teal hover:text-gray transition-all duration-200"}
          >
            Log in
          </NavLink>
        </GoogleBtn>
      </div>
    </div>
  );
}
