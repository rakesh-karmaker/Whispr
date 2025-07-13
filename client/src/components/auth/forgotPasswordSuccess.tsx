import { AuthForm } from "@/layouts/authPageLayout";
import type React from "react";
import { NavLink } from "react-router-dom";

export default function ForgotPasswordSuccess(): React.ReactNode {
  return (
    <AuthForm title="Success" subtitle="Your password has successfully changed">
      <div className="w-[29.0625em] max-2xl:w-full max-2xl:max-w-[29.0625em]">
        <NavLink
          to="/auth/login"
          className="w-full h-fit flex justify-center bg-teal hover:bg-white-2 text-pure-white hover:text-black transition-all duration-300 text-xl font-medium p-3 py-4 rounded-4xl cursor-pointer"
        >
          Log in
        </NavLink>
      </div>
    </AuthForm>
  );
}
