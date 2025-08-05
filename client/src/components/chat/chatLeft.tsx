import type React from "react";
import ContactsHeader from "@/components/contact/contactsHeader";
import ContactsList from "@/components/contact/contactsList";
import UserInfo from "@/components/ui/userInfo";

export default function ChatLeft(): React.ReactNode {
  return (
    <section className="w-full min-w-[25.75em] max-w-[25.75em] flex flex-col gap-4">
      <ContactsHeader />
      <ContactsList />
      <UserInfo />
    </section>
  );
}
