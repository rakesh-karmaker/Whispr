import type React from "react";
import CreateNewContact from "./createNewContact";
import CreateGroup from "./createGroup";

export default function ContactsHeader(): React.ReactNode {
  return (
    <div className="relative w-full min-h-24 bg-pure-white rounded-xl flex gap-3 items-center justify-center">
      <CreateNewContact />
      <CreateGroup />
    </div>
  );
}
