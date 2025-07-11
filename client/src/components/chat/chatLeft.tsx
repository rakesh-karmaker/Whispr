import type React from "react";
import ContactsHeader from "../contact/contactsHeader";

export default function ChatLeft(): React.ReactNode {
  return (
    <div className="w-full max-w-[28.75em] flex flex-col gap-4">
      <ContactsHeader />
    </div>
  );
}
