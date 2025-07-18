import { useSelectedContact } from "@/hooks/useSelectContact";
import type React from "react";
import Avatar from "@/components/ui/avatar";
import type { NewSelectedContact, SelectedContact } from "@/types/contactTypes";
import { usePreferences } from "@/hooks/usePreferences";
import { BsThreeDots } from "react-icons/bs";

export default function ChatHeader(): React.ReactNode {
  const { selectedContact, isNewSelectedContact, newSelectedContact } =
    useSelectedContact();
  const { setIsSidebarOpen } = usePreferences();

  return (
    <div className="w-full min-h-14 max-h-[5.5em] p-[1.375em] bg-pure-white rounded-xl flex-1 flex justify-between items-center gap-5">
      <ChatHeaderInfo
        selectedContact={selectedContact}
        isNewSelectedContact={isNewSelectedContact}
        newSelectedContact={newSelectedContact}
      />
      {!isNewSelectedContact && (
        <div className="flex gap-4 items-center">
          <button
            type="button"
            className="font-medium text-lg text-pure-white w-27 h-[44px] rounded-4xl bg-black flex items-center justify-center cursor-pointer hover:bg-white-2 hover:text-black transition-all duration-200"
          >
            Pin
          </button>
          <button
            type="button"
            className="text-2xl text-pure-white bg-teal w-[44px] h-[44px] rounded-full flex items-center justify-center cursor-pointer hover:bg-white-2 hover:text-black transition-all duration-200"
            onClick={() => setIsSidebarOpen(true)}
          >
            <BsThreeDots />
          </button>
        </div>
      )}
    </div>
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
    ? `${selectedContact.participantsCount} members`
    : selectedContact.isActive
    ? "Online"
    : "Offline";

  return (
    <div className="flex items-center gap-2.5">
      <Avatar src={data.image || ""} name={data.name} isActive={isActive} />
      <div className="flex flex-col">
        <h2 className="font-medium text-[1.275em]">{data.name}</h2>
        <p className="text-sm text-gray">{subHeading}</p>
      </div>
    </div>
  );
}
