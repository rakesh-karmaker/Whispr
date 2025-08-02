import React from "react";

export function FormSubmitBtn({
  children,
  isLoading = false,
}: {
  children: React.ReactNode;
  isLoading: boolean;
}): React.ReactNode {
  return (
    <button
      className="w-full h-fit bg-teal hover:bg-white-2 text-pure-white hover:text-black transition-all duration-300 text-xl max-lg:text-lg font-medium p-3 max-lg:py-3 py-4 rounded-4xl cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-teal disabled:hover:text-pure-white disabled:opacity-60"
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
      className="btn w-full h-fit text-pure-white font-medium [padding:0.7em_1.2em!important] bg-teal rounded-4xl flex items-center justify-center cursor-pointer btn border-none outline-none hover:bg-white-2 hover:text-black transition-all duration-300 disabled:cursor-not-allowed disabled:hover:bg-teal disabled:hover:text-pure-white disabled:opacity-60"
      onClick={onClick}
      disabled={isLoading}
      type="button"
    >
      {children}
    </button>
  );
}
