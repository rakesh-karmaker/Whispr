import ChatLeft from "@/components/chat/chatLeft";
import { useContacts } from "@/hooks/useContacts";
import { useSelectedContact } from "@/hooks/useSelectContact";
import { useUser } from "@/hooks/useUser";
import { useSocketStore } from "@/stores/useSocketStore";
import type { QueriedContact } from "@/types/contactTypes";
import type { UpdatedGroupData } from "@/types/socketActionTypes";
import type React from "react";
import { useEffect } from "react";
import { Outlet } from "react-router-dom";

export default function ChatLayout(): React.ReactNode {
  const { user } = useUser();

  // set up socket
  const connect = useSocketStore((s) => s.connect);
  const disconnect = useSocketStore((s) => s.disconnect);
  const socket = useSocketStore((s) => s.socket);
  const { setContacts, setPinnedContacts } = useContacts();
  const { selectedContact, setSelectedContact } = useSelectedContact();

  useEffect(() => {
    if (user?.id) {
      connect(user.id);
    }
    return () => {
      disconnect();
    };
  }, [user?.id]);

  useEffect(() => {
    if (socket) {
      socket.on("add-contact", (contactData: QueriedContact) => {
        setContacts((prevContacts) => [contactData, ...prevContacts]);
      });

      socket.on("update-group", (updatedContact: UpdatedGroupData) => {
        setContacts((prevContacts) => {
          console.log("update-group", updatedContact);
          const updatedContacts = prevContacts.map((contact) => {
            if (contact._id === updatedContact._id) {
              return {
                ...contact,
                lastMessages: [
                  ...contact.lastMessages,
                  updatedContact.updatedMessage,
                ],
                contactName: updatedContact.name,
                contactImage: updatedContact.image,
              };
            }
            return contact;
          });
          return updatedContacts;
        });

        setPinnedContacts((prevPinnedContacts) => {
          const updatedPinnedContacts = prevPinnedContacts.map((contact) => {
            if (contact._id === updatedContact._id) {
              return {
                ...contact,
                lastMessages: [
                  ...contact.lastMessages,
                  updatedContact.updatedMessage,
                ],
                contactName: updatedContact.name,
                contactImage: updatedContact.image,
              };
            }
            return contact;
          });
          return updatedPinnedContacts;
        });

        if (updatedContact._id === selectedContact?._id) {
          setSelectedContact({ ...selectedContact, ...updatedContact });
        }
      });
    }
  }, [socket]);

  return (
    <div className="h-screen flex gap-4 p-4 bg-white-3 chat-layout">
      <ChatLeft />
      <Outlet />
    </div>
  );
}
