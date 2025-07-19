import { useSelectedContact } from "@/hooks/useSelectContact";
import { allowedSocialTypesIcons } from "@/services/data";
import type React from "react";
import { Link } from "react-router-dom";
import ParticipantList from "./participantList";

export default function SidebarBody(): React.ReactNode {
  return (
    <div className="w-full h-full flex flex-col gap-7">
      <ChatInfo />
      <ParticipantList />
    </div>
  );
}

function ChatInfo(): React.ReactNode {
  const { selectedContact } = useSelectedContact();
  return (
    <div className="flex gap-5 items-center">
      <img
        src={selectedContact.image}
        alt={selectedContact.name}
        className="w-23 h-23 rounded-full object-cover object-center"
      />
      <div className="flex flex-col gap-2">
        <h2 className="font-semibold text-2xl">{selectedContact.name}</h2>
        <div className="flex items-center gap-4">
          {selectedContact.socialLinks &&
            selectedContact.socialLinks.slice(0, 5).map((link) => (
              <Link
                to={link.link}
                target="_blank"
                className="text-xl text-gray hover:text-teal transition-all duration-200"
                key={link.link}
              >
                {
                  allowedSocialTypesIcons[
                    link.type as keyof typeof allowedSocialTypesIcons
                  ]
                }
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
