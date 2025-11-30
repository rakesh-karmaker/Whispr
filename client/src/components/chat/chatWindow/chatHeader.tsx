import { useSelectedContact } from "@/hooks/useSelectContact";
import type React from "react";
import Avatar from "@/components/ui/avatar";
import type { NewSelectedContact, SelectedContact } from "@/types/contactTypes";
import { usePreferences } from "@/hooks/usePreferences";
import { BsPinAngleFill, BsThreeDots } from "react-icons/bs";
import { useMutation } from "@tanstack/react-query";
import { pinContact, unpinContact } from "@/lib/api/contacts";
import { useContacts } from "@/hooks/useContacts";
import Tooltip from "@mui/material/Tooltip";
import { FaArrowLeft } from "react-icons/fa";
import { RiUnpinFill } from "react-icons/ri";

export default function ChatHeader(): React.ReactNode {
  const { selectedContact, isNewSelectedContact, newSelectedContact } =
    useSelectedContact();
  const { isSidebarOpen, setIsSidebarOpen } = usePreferences();

  return (
    <div className="w-full min-h-14 max-mid:fixed max-mid:top-0 max-mid:z-99 max-h-[4.75em] max-mid:max-h-[4em] px-[1.375em] bg-pure-white dark:bg-d-dark-gray rounded-xl max-mid:rounded-none flex-1 flex justify-between items-center gap-5">
      <ChatHeaderInfo
        selectedContact={selectedContact}
        isNewSelectedContact={isNewSelectedContact}
        newSelectedContact={newSelectedContact}
      />
      {!isNewSelectedContact && (
        <div className="flex gap-4 max-md:gap-2 items-center">
          <PinChatButton />
          <Tooltip
            title={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
            arrow
          >
            <button
              type="button"
              className={`text-xl w-10 h-10 max-md:w-9 max-md:h-9 rounded-full flex items-center justify-center cursor-pointer hover:bg-white-2 dark:hover:bg-d-white/30 hover:text-black dark:hover:text-d-white transition-all duration-200 ${
                isSidebarOpen
                  ? " bg-white-2 text-black dark:bg-d-light-dark-gray dark:text-d-white/90"
                  : " text-pure-white bg-teal"
              }`}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <BsThreeDots />
            </button>
          </Tooltip>
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
    <Tooltip
      title={isPinned ? "Unpin chat" : "Pin chat"}
      arrow
      placement="bottom"
    >
      <button
        type="button"
        className="font-medium text-normal text-pure-white w-24 max-mid:w-9 h-10 max-mid:h-9 rounded-4xl bg-black dark:bg-d-light-dark-gray flex items-center justify-center cursor-pointer hover:bg-white-2 dark:hover:bg-d-white/30 hover:text-black dark:hover:text-d-white transition-all duration-200 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:text-pure-white disabled:opacity-60"
        onClick={() => {
          pinContactMutation.mutate({
            chatId: selectedContact._id,
            isPinned: !isPinned,
          });
        }}
        disabled={pinContactMutation.isPending}
      >
        <span className="max-mid:hidden">{isPinned ? "Unpin" : "Pin"}</span>
        <span className="mid:hidden">
          {isPinned ? <RiUnpinFill /> : <BsPinAngleFill />}
        </span>
      </button>
    </Tooltip>
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

  const { setIsChatOpen } = usePreferences();

  return (
    <div className="flex items-center gap-2.5 max-mid:gap-1.5">
      <button
        className={`min-w-11 min-h-11 max-h-11 max-w-11 max-mid:min-w-9 max-mid:min-h-9 max-mid:max-w-9 max-mid:max-h-9 flex items-center justify-center bg-white-2 dark:bg-d-light-dark-gray text-black dark:text-d-white rounded-full text-xl max-mid:text-lg hover:bg-light-gray/30 dark:hover:bg-d-light-dark-gray/50 hover:text-black/80 dark:hover:text-pure-white/60 transition-all duration-200 cursor-pointer mid:hidden`}
        onClick={() => setIsChatOpen(false)}
        type="button"
        aria-label="Go back to contacts"
      >
        <FaArrowLeft />
      </button>

      <Avatar
        src={data.image || ""}
        name={data.name}
        isActive={isActive}
        className="max-mid:min-w-9 max-mid:min-h-9 max-mid:max-w-9 max-mid:max-h-9"
      />
      <div className="flex flex-col">
        <Tooltip title={data.name} arrow placement="bottom">
          <h2 className="font-medium max-mid:text-[0.93rem] line-clamp-1 max-mid:line-clamp-2 max-mid:break-words max-mid:leading-tight dark:text-d-white/90">
            {data.name}
          </h2>
        </Tooltip>
        <p className="text-[0.85rem] text-gray dark:text-d-white/45 max-mid:hidden">
          {subHeading}
        </p>
      </div>
    </div>
  );
}
