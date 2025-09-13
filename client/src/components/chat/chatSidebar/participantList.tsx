import { useSelectedContact } from "@/hooks/useSelectContact";
import type React from "react";
import ParticipantPreview from "./participantPreview";
import { useState, useMemo, memo } from "react";
import type { SelectedContact } from "@/types/contactTypes";
import AddParticipant from "./addParticipant";

export default memo(function ParticipantList(): React.ReactNode {
  const { selectedContact } = useSelectedContact();
  const [showAll, setShowAll] = useState<boolean>(false);

  return (
    <div className="w-full h-hit flex flex-col gap-4 relative mt-5">
      <div className="absolute -top-5 w-full h-[1px] bg-[#D8D8D8]/70 dark:bg-d-light-dark-gray/90 transition-all duration-200" />

      <div className="w-full h-fit flex justify-between items-center">
        <p className="font-medium text-gray dark:text-d-gray">Members</p>
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
    </div>
  );
});

function Participants({
  showAll,
  selectedContact,
}: {
  showAll: boolean;
  selectedContact: SelectedContact;
}): React.ReactNode {
  // Memoize the combined participants array to prevent recreation on every render
  const participants = useMemo(() => {
    if (!selectedContact.admins && !selectedContact.participants) return [];
    return selectedContact.admins
      ? [...selectedContact.admins, ...selectedContact.participants]
      : selectedContact.participants;
  }, [selectedContact.admins, selectedContact.participants]);

  // Memoize admin IDs to avoid repeated lookups
  const adminIds = useMemo(() => {
    if (!selectedContact.admins) return new Set();
    return new Set(selectedContact.admins.map((admin) => admin._id));
  }, [selectedContact.admins]);

  // Memoize the displayed participants to prevent unnecessary re-renders
  const displayedParticipants = useMemo(() => {
    if (!participants || participants.length === 0) return [];
    return showAll ? participants : participants.slice(0, 5);
  }, [participants, showAll]);

  if (!participants || participants.length === 0) {
    return <p className="text-gray">No participants found</p>;
  }

  return (
    <div className="w-full h-full flex flex-col gap-3.5">
      {displayedParticipants.map((participant) => (
        <div key={participant._id} className="participant-list-item">
          <ParticipantPreview
            participant={participant}
            isAdmin={adminIds.has(participant._id)}
          />
        </div>
      ))}
      {selectedContact.isGroup && <AddParticipant />}
    </div>
  );
}
