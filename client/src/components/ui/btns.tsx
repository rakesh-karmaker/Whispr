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
      className="w-full h-fit bg-teal hover:bg-white-2 text-pure-white hover:text-black transition-all duration-300 text-xl font-medium p-3 py-4 rounded-4xl cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-teal disabled:hover:text-pure-white disabled:opacity-60"
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
      className="w-full h-fit opacity-85 relative bg-white-2 hover:bg-light-gray text-black hover:text-black transition-all duration-300 text-xl font-medium p-3 py-4 rounded-4xl cursor-pointer flex justify-center items-center gap-2 disabled:cursor-not-allowed disabled:hover:bg-white-2 disabled:hover:text-black disabled:opacity-60"
      onClick={onClick}
      disabled={isLoading}
      type="button"
    >
      <span className="absolute left-3 text-4xl">{icon}</span>
      {children}
    </button>
  );
}
