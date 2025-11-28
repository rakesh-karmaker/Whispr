import type React from "react";
import CreateNewContact from "./createNewContact";
import CreateGroup from "./createGroup";

export default function ContactsHeader(): React.ReactNode {
  return (
    <div className="relative w-full px-[1.375em] h-[4.75em] bg-pure-white dark:bg-d-dark-gray rounded-xl flex gap-3 items-center justify-center">
      <CreateNewContact />
      <CreateGroup />
    </div>
  );
}
