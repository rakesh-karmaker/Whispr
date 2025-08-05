import ChatLeft from "@/components/chat/chatLeft";
import { useUser } from "@/hooks/useUser";
import {
  addContact,
  addParticipant,
  deleteGroup,
  makeAdmin,
  messageSaw,
  messageSeen,
  removeParticipant,
  updateContact,
} from "@/lib/socket/contactActions";
import { useSocketStore } from "@/stores/useSocketStore";
import type { QueriedContact } from "@/types/contactTypes";
import type {
  AddParticipantFunctionProps,
  MakeAdminFunctionProps,
  MessageSawFunctionProps,
  MessageSeenFunctionProps,
  RemoveParticipantFunctionProps,
  UpdatedGroupData,
} from "@/types/socketActionTypes";
import type React from "react";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function ChatLayout(): React.ReactNode {
  const { user } = useUser();
  const navigate = useNavigate();

  // set up socket
  const connect = useSocketStore((s) => s.connect);
  const disconnect = useSocketStore((s) => s.disconnect);
  const socket = useSocketStore((s) => s.socket);

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
      socket.on("add-contact", (contactData: QueriedContact) =>
        addContact(contactData)
      );

      socket.on("update-group", (updatedContact: UpdatedGroupData) =>
        updateContact(updatedContact)
      );

      socket.on("delete-group", (data: { contactId: string }) => {
        const nextSelectedContact = deleteGroup(data.contactId);
        if (nextSelectedContact !== undefined && nextSelectedContact !== null) {
          navigate(`/chat/${nextSelectedContact._id}`, { replace: true });
        }
      });

      socket.on("make-admin", (data: MakeAdminFunctionProps) => {
        makeAdmin(data);
      });

      socket.on(
        "remove-participant",
        (data: RemoveParticipantFunctionProps) => {
          const nextSelectedContact = removeParticipant(data);

          if (
            nextSelectedContact !== undefined &&
            nextSelectedContact !== null
          ) {
            navigate(`/chat/${nextSelectedContact._id}`, { replace: true });
          }
        }
      );

      socket.on("message-seen", (data: MessageSeenFunctionProps) =>
        messageSeen(data)
      );

      socket.on("message-saw", (data: MessageSawFunctionProps) =>
        messageSaw(data)
      );

      socket.on("add-participant", (data: AddParticipantFunctionProps) =>
        addParticipant(data)
      );
    }

    return () => {
      if (socket) {
        socket.off("add-contact");
        socket.off("update-group");
        socket.off("delete-group");
        socket.off("make-admin");
        socket.off("remove-participant");
        socket.off("add-participant");
      }
    };
  }, [socket]);

  return (
    <div className="h-screen max-w-screen flex gap-4 p-4 bg-white-3 chat-layout">
      <ChatLeft />
      <Outlet />
    </div>
  );
}
