import type React from "react";
import ContactsHeader from "@/components/contact/contactsHeader";
import ContactsList from "@/components/contact/contactsList";

export default function ChatLeft(): React.ReactNode {
  return (
    <section className="w-full max-w-[28.75em] flex flex-col gap-4">
      <ContactsHeader />
      <ContactsList />
    </section>
  );
}
