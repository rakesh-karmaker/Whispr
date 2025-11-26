import { useSelectedContact } from "@/hooks/useSelectContact";
import type React from "react";
import ParticipantPreview from "./participantPreview";
import { useState, useMemo, useRef, useEffect } from "react";
import type { SelectedContact } from "@/types/contactTypes";
import AddParticipant from "./addParticipant";
import Modal from "@mui/material/Modal";
import ModalHeader from "@/components/ui/modalHeader";
import { useVirtualizer } from "@tanstack/react-virtual";

export default function ParticipantList(): React.ReactNode {
  const { selectedContact } = useSelectedContact();
  const [showAll, setShowAll] = useState<boolean>(false);

  // Memoize the combined participants array to prevent recreation on every render
  const participants = useMemo(() => {
    if (!selectedContact.admins && !selectedContact.participants) return [];
    return selectedContact.admins
      ? [...selectedContact.admins, ...selectedContact.participants]
      : selectedContact.participants;
  }, [selectedContact.admins.length, selectedContact.participants.length]);

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

      <Participants
        selectedContact={selectedContact}
        participants={participants}
      />
      <Modal
        open={showAll}
        onClose={() => setShowAll(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="flex items-center justify-center h-fit min-h-full absolute max-sm:bg-pure-white dark:max-sm:bg-d-dark-gray"
      >
        <div className="w-full max-w-[28.75em] max-sm:max-w-full min-h-fit max-sm:min-h-screen p-7 rounded-lg max-sm:rounded-none bg-pure-white dark:bg-d-dark-gray flex flex-col items-center max-sm:justify-center gap-3 relative">
          <ModalHeader
            title="All Participants"
            onClick={() => setShowAll(false)}
          />
          <ParticipantsList
            selectedContact={selectedContact}
            participants={participants}
          />
        </div>
      </Modal>
    </div>
  );
}

function ParticipantsList({
  selectedContact,
  participants,
}: {
  selectedContact: SelectedContact;
  participants: Participant[];
}): React.ReactNode {
  // Memoize admin IDs to avoid repeated lookups
  const adminIds = new Set(selectedContact.admins.map((admin) => admin._id));

  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: participants.length || 0,
    estimateSize: () => 60, // Assuming each item is approximately 60px tall
    getScrollElement: () => scrollRef.current,
    overscan: 3,
  });

  useEffect(() => {
    // Debounce measurement to prevent excessive re-measures
    const timeoutId = setTimeout(() => {
      virtualizer.measure();
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [
    participants.length,
    selectedContact.admins,
    selectedContact.participants,
    virtualizer,
  ]);

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div ref={scrollRef} className="w-full h-full max-h-[50vh] overflow-auto">
      <div
        className="relative w-full virtual-container"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          // contain: "layout style paint", // Additional containment
          contain: "strict",
        }}
      >
        {virtualItems.map((vItem) => {
          const participant = participants[vItem.index];
          if (!participant) return null; // Safety check

          return (
            <div
              className="absolute w-full px-1 virtual item"
              style={{
                // transform: `translateY(${vItem.start}px)`,
                willChange: "transform", // Optimize for animations
                transform: `translate3d(0, ${vItem.start}px, 0)`, // <--- CHANGE THIS
              }}
              key={participant._id}
            >
              <ParticipantPreview
                participant={participant}
                isAdmin={adminIds.has(participant._id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface Participant {
  _id: string;
  name: string;
  avatar: string;
}

function Participants({
  selectedContact,
  participants,
}: {
  selectedContact: SelectedContact;
  participants: Participant[];
}): React.ReactNode {
  // Memoize admin IDs to avoid repeated lookups
  const adminIds = new Set(selectedContact.admins.map((admin) => admin._id));

  // Memoize the displayed participants to prevent unnecessary re-renders
  const displayedParticipants = useMemo(() => {
    if (!participants || participants.length === 0) return [];
    return participants.slice(0, 5); // Show only first 5 participants
  }, [participants]);

  if (!participants || participants.length === 0) {
    return <p className="text-gray">No participants found</p>;
  }

  return (
    <div className="w-full h-full flex flex-col gap-2.5">
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
