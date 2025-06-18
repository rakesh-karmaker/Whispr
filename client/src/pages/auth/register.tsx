import { AuthForm } from "@/layouts/auth";
import type React from "react";
import { type SingUpSchema } from "@/lib/zodSchemas/authSchema";
import RegisterForm from "@/components/auth/registerForm";
import { BtnWithIcon } from "@/components/ui/btns";
import { FcGoogle } from "react-icons/fc";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

const serverURL = import.meta.env.VITE_SERVER_URL as string;

type OAuthResponse = {
  email: string;
  new: boolean;
  name?: string;
  avatar?: string;
  redisId?: string;
  firstName?: string;
  lastName?: string;
  id?: string;
};

export default function Register(): React.ReactNode {
  const navigate = useNavigate();

  const [isOAuthLoading, setIsOAuthLoading] = useState<boolean>(false);

  function signupWithGoogle() {
    setIsOAuthLoading(true);
    window.open(
      `${serverURL}/auth/google/`, // new route
      "Google Login",
      "width=500,height=600"
    );

    // Listen for message from popup
    window.addEventListener("message", (event) => {
      if (event.origin !== serverURL) return; // important for security

      const response: OAuthResponse = event.data.user;
      setIsOAuthLoading(false);

      if (response.new) {
        navigate(`/auth/profile?id=${response.redisId}`);
      }

      // if (userId) {
      //   window.location.href = `/profile-select?id=${userId}`;
      // }
    });
  }

  return (
    <div className="flex flex-col gap-7">
      <AuthForm
        title="Create your account"
        subtitle="Join Whispr and start connecting with your friends"
      >
        <RegisterForm />
      </AuthForm>

      <OrLine />

      <GoogleBtn
        signupWithGoogle={signupWithGoogle}
        isLoading={isOAuthLoading}
      />
    </div>
  );
}

function OrLine(): React.ReactNode {
  return (
    <p className="w-full relative flex justify-center items-center">
      <span className="z-10 bg-pure-white px-3.5 text-light-dark-gray font-semibold">
        OR
      </span>
      <span className="w-full h-[1px] bg-gray absolute"></span>
    </p>
  );
}

function GoogleBtn({
  signupWithGoogle,
  isLoading,
}: {
  signupWithGoogle: () => void;
  isLoading: boolean;
}): React.ReactNode {
  return (
    <div className="flex flex-col gap-7">
      <BtnWithIcon
        icon={<FcGoogle />}
        onClick={signupWithGoogle}
        isLoading={isLoading}
      >
        Continue with Google
      </BtnWithIcon>

      <p className="text-center font-medium text-gray">
        Already have an account?{" "}
        <NavLink to="/auth/login" className={"text-teal"}>
          Log in
        </NavLink>
      </p>
    </div>
  );
}
