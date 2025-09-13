import type { SearchedContact } from "@/types/contactTypes";
import type React from "react";
import Avatar from "./avatar";

export default function UserPreview({
  contactData,
}: {
  contactData: SearchedContact;
}): React.ReactNode {
  return (
    <div className="w-full h-full flex p-3 items-center transition-all duration-200 hover:bg-white-2 dark:hover:bg-d-light-dark-gray focus-within:bg-white-2 dark:focus-within:bg-d-light-dark-gray">
      <div className="flex gap-2.5 items-center relative">
        <Avatar
          src={contactData.avatar}
          name={contactData.name}
          isActive={contactData.isActive}
        />

        <div className="flex flex-col text-left">
          <h4 className="text-lg font-medium text-left dark:text-d-white/90">
            {contactData.name}
          </h4>
          <p className="text-sm text-gray dark:text-d-white/70">
            {contactData.email}
          </p>
        </div>
      </div>
    </div>
  );
}
