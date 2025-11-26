import Tooltip from "@mui/material/Tooltip";
import React from "react";
import { FaPlus } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { IoMdPersonAdd } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";

export function FormSubmitBtn({
  children,
  isLoading = false,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}): React.ReactNode {
  return (
    <button
      className="w-full h-fit bg-teal hover:bg-white-2 dark:hover:bg-d-light-dark-gray text-pure-white hover:text-black dark:hover:text-d-white/90 transition-all duration-300 text-xl max-lg:text-lg font-medium p-3 max-lg:py-3 py-4 rounded-4xl cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-teal disabled:hover:text-pure-white disabled:opacity-60"
      type="submit"
      disabled={isLoading}
    >
      {children}
    </button>
  );
}

export function BtnWithIcon({
  icon,
  onClick,
  isLoading = false,
  children,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <button
      className={
        "w-full h-fit opacity-85 relative bg-white-2 hover:bg-light-gray text-black hover:text-black transition-all duration-300 text-xl max-lg:text-lg font-medium p-3 max-lg:py-3 py-4 rounded-4xl cursor-pointer flex justify-center items-center gap-2 disabled:cursor-not-allowed disabled:hover:bg-white-2 disabled:hover:text-black disabled:opacity-60"
      }
      onClick={onClick}
      disabled={isLoading}
      type="button"
    >
      <span className="absolute left-3 text-4xl max-sm:hidden">{icon}</span>
      {children}
    </button>
  );
}

export function PrimaryBtn({
  onClick,
  isLoading = false,
  children,
}: {
  onClick: () => void;
  isLoading?: boolean;
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <button
      className="btn w-full h-fit text-pure-white font-medium [padding:0.7em_1.2em!important] bg-teal rounded-4xl flex items-center justify-center cursor-pointer btn border-none outline-none hover:bg-white-2 dark:hover:bg-d-light-dark-gray hover:text-black dark:hover:text-d-white transition-all duration-300 disabled:cursor-not-allowed disabled:hover:bg-teal disabled:hover:text-pure-white disabled:opacity-60"
      onClick={onClick}
      disabled={isLoading}
      type="button"
    >
      {children}
    </button>
  );
}

export function AddParticipantBtn({
  setOpen,
  open,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
}): React.ReactNode {
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full flex justify-between items-center hover:bg-white-2 dark:hover:bg-d-light-dark-gray transition-all duration-200 rounded-lg cursor-pointer"
    >
      <span className="flex items-center gap-2">
        <span className="min-w-11 min-h-11 max-w-11 max-h-11 rounded-full flex justify-center items-center bg-white-2 text-black dark:bg-d-light-dark-gray dark:text-d-white/90">
          <IoMdPersonAdd className="text-xl" />
        </span>
        <span className="ml-1.5 dark:text-d-white/90">Add participant</span>
      </span>
    </button>
  );
}

export function AddSocialLinkButton({
  append,
}: {
  append: (value: { type: string; link: string }) => void;
}) {
  return (
    <Tooltip title="Add social link" arrow placement="top">
      <button
        className={`min-w-10 min-h-10 max-h-10 max-w-10 flex items-center justify-center bg-white-2 dark:bg-d-light-dark-gray text-teal rounded-full text-xl hover:bg-teal hover:text-pure-white transition-all duration-200 cursor-pointer`}
        onClick={() => append({ type: "", link: "" })}
        type="button"
        aria-label="Add social link"
      >
        <FaPlus />
      </button>
    </Tooltip>
  );
}

export function RemoveSocialLinkButton({
  remove,
  index,
}: {
  remove: (index: number) => void;
  index: number;
}) {
  return (
    <Tooltip title="Remove social link" arrow placement="top">
      <button
        className={`min-w-10 min-h-10 max-h-10 max-w-10 flex items-center justify-center bg-white-2 dark:bg-d-light-dark-gray text-red rounded-full text-xl hover:bg-red hover:text-pure-white transition-all duration-200 cursor-pointer`}
        onClick={() => remove(index)}
        type="button"
        aria-label="Remove social link"
      >
        <RxCross2 />
      </button>
    </Tooltip>
  );
}

export function GoogleBtn({
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
