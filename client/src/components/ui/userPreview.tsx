import type { SearchedContact } from "@/types/contactTypes";
import type React from "react";
import Avatar from "./avatar";

export default function UserPreview({
  contactData,
}: {
  contactData: SearchedContact;
}): React.ReactNode {
  return (
    <div className="w-full h-full flex p-3 items-center transition-all duration-200 hover:bg-white-2">
      <div className="flex gap-2.5 items-center relative">
        <Avatar
          src={contactData.avatar}
          name={contactData.name}
          isActive={contactData.isActive}
        />

        <div className="flex flex-col">
          <h4 className="text-lg font-medium">{contactData.name}</h4>
          <p className="text-sm text-gray">{contactData.email}</p>
        </div>
      </div>
    </div>
  );
}
