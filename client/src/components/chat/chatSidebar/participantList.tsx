import { useSelectedContact } from "@/hooks/useSelectContact";
import type React from "react";
import ParticipantPreview from "./participantPreview";

export default function ParticipantList(): React.ReactNode {
  const { selectedContact } = useSelectedContact();
  return (
    <div className="w-full h-full flex flex-col gap-4 relative mt-5">
      <div className="w-full h-fit flex justify-between items-center">
        <p className="font-medium text-gray">Members</p>
        {selectedContact.participantsCount > 8 && (
          <button
            type="button"
            className="font-medium text-teal bg-none border-none outline-none hover:text-gray cursor-pointer transition-all duration-200"
          >
            See all
          </button>
        )}
      </div>
      <Participants />
      <div className="absolute -top-5 w-full h-[1px] bg-[#D8D8D8]/70 transition-all duration-200" />
    </div>
  );
}

function Participants(): React.ReactNode {
  const { selectedContact } = useSelectedContact();
  return (
    <div className="w-full h-full flex flex-col gap-3.5">
      {selectedContact.admins &&
        selectedContact.admins.map((admin) => (
          <ParticipantPreview
            key={admin._id}
            participant={admin}
            isAdmin={true}
          />
        ))}
      {selectedContact.participants &&
        selectedContact.participants.map((participant) => (
          <ParticipantPreview
            key={participant._id}
            participant={participant}
            isAdmin={false}
          />
        ))}
    </div>
  );
}
