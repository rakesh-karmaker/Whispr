import type React from "react";
import ContactsHeader from "@/components/contact/contactsHeader";
import ContactsList from "@/components/contact/contactsList";
import UserInfo from "@/components/ui/userInfo";

export default function ChatLeft(): React.ReactNode {
  return (
    <section className="w-auto min-w-[22em] max-w-[25.75em] max-xl:max-w-[22em] flex flex-col gap-4 max-mid:gap-0 max-mid:min-w-[100svw] max-mid:max-h-[100svh]">
      <ContactsHeader />
      <ContactsList />
      <UserInfo />
    </section>
  );
}
