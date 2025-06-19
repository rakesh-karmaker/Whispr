import { FcGoogle } from "react-icons/fc";
import { BtnWithIcon } from "../ui/btns";
import type React from "react";

export default function GoogleBtn({
  signupWithGoogle,
  isLoading,
  children,
}: {
  signupWithGoogle: () => void;
  isLoading: boolean;
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <div className="flex flex-col gap-7 w-full">
      <BtnWithIcon
        icon={<FcGoogle />}
        onClick={signupWithGoogle}
        isLoading={isLoading}
      >
        Continue with Google
      </BtnWithIcon>

      <p className="text-center font-medium text-gray">{children}</p>
    </div>
  );
}
