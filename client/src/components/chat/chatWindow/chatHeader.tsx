import { useSelectedContact } from "@/hooks/useSelectContact";
import type React from "react";
import Avatar from "@/components/ui/avatar";
import type { NewSelectedContact, SelectedContact } from "@/types/contactTypes";
import { usePreferences } from "@/hooks/usePreferences";
import { BsThreeDots } from "react-icons/bs";
import { useMutation } from "@tanstack/react-query";
import { pinContact, unpinContact } from "@/lib/api/contacts";
import { useContacts } from "@/hooks/useContacts";

export default function ChatHeader(): React.ReactNode {
  const { selectedContact, isNewSelectedContact, newSelectedContact } =
    useSelectedContact();
  const { isSidebarOpen, setIsSidebarOpen } = usePreferences();

  return (
    <div className="w-full min-h-14 max-h-[5.5em] p-[1.375em] bg-pure-white dark:bg-d-dark-gray rounded-xl flex-1 flex justify-between items-center gap-5">
      <ChatHeaderInfo
        selectedContact={selectedContact}
        isNewSelectedContact={isNewSelectedContact}
        newSelectedContact={newSelectedContact}
      />
      {!isNewSelectedContact && (
        <div className="flex gap-4 items-center">
          <PinChatButton />
          <button
            type="button"
            className={`text-2xl w-[44px] h-[44px] rounded-full flex items-center justify-center cursor-pointer hover:bg-white-2 dark:hover:bg-d-white/30 hover:text-black dark:hover:text-d-white transition-all duration-200 ${
              isSidebarOpen
                ? " bg-white-2 text-black dark:bg-d-light-dark-gray dark:text-d-white/90"
                : " text-pure-white bg-teal"
            }`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <BsThreeDots />
          </button>
        </div>
      )}
    </div>
  );
}

function PinChatButton(): React.ReactNode {
  const { contacts, setContacts, pinnedContacts, setPinnedContacts } =
    useContacts();
  const { selectedContact } = useSelectedContact();

  const pinContactMutation = useMutation({
    mutationFn: (data: { chatId: string; isPinned: boolean }) => {
      if (data.isPinned) {
        return pinContact(data.chatId);
      } else {
        return unpinContact(data.chatId);
      }
    },
    onSuccess: (data) => {
      if (data.pinned) {
        const contact = contacts.find((c) => c._id === data.contactId);
        if (contact) {
          // remove the contact from the allContacts
          const index = contacts.findIndex((c) => c._id === contact?._id);
          if (index !== -1) {
            contacts.splice(index, 1);
            setContacts([...contacts]);
          }
          // add the contact to the pinnedContacts
          pinnedContacts.push(contact);
          const sortedContacts = [...pinnedContacts].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          setPinnedContacts([...sortedContacts]);
        }
      } else if (!data.pinned) {
        const contact = pinnedContacts.find((c) => c._id === data.contactId);
        if (contact) {
          // remove the contact from the pinnedContacts
          const index = pinnedContacts.findIndex((c) => c._id === contact?._id);
          if (index !== -1) {
            pinnedContacts.splice(index, 1);
            setPinnedContacts([...pinnedContacts]);
          }
          // add the contact to the allContacts
          contacts.unshift(contact);
          const sortedContacts = [...contacts].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
          setContacts(sortedContacts);
        }
      }
    },
  });

  const isPinned = pinnedContacts.some((c) => c._id === selectedContact._id);

  return (
    <button
      type="button"
      className="font-medium text-lg text-pure-white w-27 h-11 rounded-4xl bg-black dark:bg-d-light-dark-gray flex items-center justify-center cursor-pointer hover:bg-white-2 dark:hover:bg-d-white/30 hover:text-black dark:hover:text-d-white transition-all duration-200 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-pure-white disabled:opacity-60"
      onClick={() => {
        pinContactMutation.mutate({
          chatId: selectedContact._id,
          isPinned: !isPinned,
        });
      }}
      disabled={pinContactMutation.isPending}
    >
      {isPinned ? "Unpin" : "Pin"}
    </button>
  );
}

function ChatHeaderInfo({
  selectedContact,
  isNewSelectedContact,
  newSelectedContact,
}: {
  selectedContact: SelectedContact;
  isNewSelectedContact: boolean;
  newSelectedContact: NewSelectedContact;
}) {
  const data = isNewSelectedContact ? newSelectedContact : selectedContact;
  const isActive = isNewSelectedContact
    ? newSelectedContact.isActive
    : selectedContact.isGroup
    ? false
    : selectedContact.isActive;
  const subHeading = isNewSelectedContact
    ? newSelectedContact.isActive
      ? "Online"
      : "Offline"
    : selectedContact.isGroup
    ? `${selectedContact.participantCount} members`
    : selectedContact.isActive
    ? "Online"
    : "Offline";

  return (
    <div className="flex items-center gap-2.5">
      <Avatar src={data.image || ""} name={data.name} isActive={isActive} />
      <div className="flex flex-col">
        <h2 className="font-medium text-lg line-clamp-1 dark:text-d-white/90">
          {data.name}
        </h2>
        <p className="text-sm text-gray dark:text-d-white/45">{subHeading}</p>
      </div>
    </div>
  );
}
