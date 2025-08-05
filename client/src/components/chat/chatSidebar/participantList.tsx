import { useSelectedContact } from "@/hooks/useSelectContact";
import type React from "react";
import ParticipantPreview from "./participantPreview";
import { useState } from "react";
import type { SelectedContact } from "@/types/contactTypes";
import AddParticipant from "./addParticipant";

export default function ParticipantList(): React.ReactNode {
  const { selectedContact } = useSelectedContact();
  const [showAll, setShowAll] = useState<boolean>(false);

  return (
    <div className="w-full h-hit flex flex-col gap-4 relative mt-5">
      <div className="w-full h-fit flex justify-between items-center">
        <p className="font-medium text-gray">Members</p>
        {selectedContact.participantCount > 8 && (
          <button
            type="button"
            className="font-medium text-teal text-sm bg-none border-none outline-none hover:text-gray cursor-pointer transition-all duration-200"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? "Show less" : "Show all"}
          </button>
        )}
      </div>
      <Participants showAll={showAll} selectedContact={selectedContact} />
      <div className="absolute -top-5 w-full h-[1px] bg-[#D8D8D8]/70 transition-all duration-200" />
    </div>
  );
}

function Participants({
  showAll,
  selectedContact,
}: {
  showAll: boolean;
  selectedContact: SelectedContact;
}): React.ReactNode {
  const participants = selectedContact.admins
    ? [...selectedContact.admins, ...selectedContact.participants]
    : selectedContact.participants;

  if (!participants || participants.length === 0) {
    return <p className="text-gray">No participants found</p>;
  }

  return (
    <div className="w-full h-full flex flex-col gap-3.5">
      {showAll
        ? participants.map((participant) => (
            <ParticipantPreview
              key={participant._id}
              participant={participant}
              isAdmin={
                selectedContact.admins &&
                selectedContact.admins.some(
                  (admin) => admin._id === participant._id
                )
              }
            />
          ))
        : participants
            .slice(0, 5)
            .map((participant) => (
              <ParticipantPreview
                key={participant._id}
                participant={participant}
                isAdmin={
                  selectedContact.admins &&
                  selectedContact.admins.some(
                    (admin) => admin._id === participant._id
                  )
                }
              />
            ))}
      {selectedContact.isGroup && <AddParticipant />}
    </div>
  );
}
