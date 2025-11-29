import ChatLeft from "@/components/chat/chatLeft";
import { usePreferences } from "@/hooks/usePreferences";
import { useUser } from "@/hooks/useUser";
import {
  addContact,
  deleteGroup,
  updateContact,
} from "@/lib/socketActions/contactActions";
import {
  messageSaw,
  messageSeen,
  sendMessage,
} from "@/lib/socketActions/messageActions";
import {
  addParticipant,
  makeAdmin,
  removeParticipant,
} from "@/lib/socketActions/participantActions";
import { useSocketStore } from "@/stores/useSocketStore";
import type { QueriedContact } from "@/types/contactTypes";
import type { MessageType } from "@/types/messageTypes";
import type {
  AddParticipantFunctionProps,
  MakeAdminFunctionProps,
  MessageSawFunctionProps,
  MessageSeenFunctionProps,
  RemoveParticipantFunctionProps,
  UpdatedGroupData,
} from "@/types/socketActionTypes";
import { useColorScheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
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
    if (!user?.id) {
      navigate("/auth/login", { replace: true });
    }
  }, [user, navigate]);

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

      socket.on("add-participant", (data: AddParticipantFunctionProps) =>
        addParticipant(data)
      );

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

      socket.on("sendMessage", (data: MessageType) => sendMessage(data));

      socket.on("message-seen", (data: MessageSeenFunctionProps) =>
        messageSeen(data)
      );

      socket.on("message-saw", (data: MessageSawFunctionProps) =>
        messageSaw(data)
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

  const { isChatOpen } = usePreferences();

  // handle dark mode
  const { mode } = useColorScheme();
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  useEffect(() => {
    if (mode === "system") {
      document.documentElement.classList.toggle("dark", prefersDarkMode);
    } else {
      document.documentElement.classList.toggle("dark", mode === "dark");
    }
  }, [mode, prefersDarkMode]);

  return (
    <div className="h-screen w-screen flex justify-center chat-layout">
      <div className="h-screen w-screen max-w-[2400px] max-mid:max-w-screen max-mid:overflow-x-hidden p-4 max-mid:p-0 bg-white-3 dark:bg-black">
        <div
          className="w-full h-screen transition-all duration-300 ease-in-out flex gap-4 max-mid:gap-0"
          style={{
            transform: `translateX(${isChatOpen ? -100 : 0}%)`,
          }}
        >
          <ChatLeft />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
