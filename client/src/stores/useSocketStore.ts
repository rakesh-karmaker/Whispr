import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { SERVER } from "@/config/constants";
import { useContactsStore } from "./useContactsStore";
import { useSelectedContactStore } from "./useSelectedContactStore";

interface SocketState {
  socket: Socket | null;
  connect: (userId: string) => void;
  disconnect: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  socket: null,

  connect: (userId) => {
    const socket = io(SERVER, {
      withCredentials: true,
      query: { userId },
    });

    set({ socket });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on(
      "updateUserActiveStatus",
      (data: { contactId: string; isActive: boolean }) => {
        const changeActiveContact =
          useContactsStore.getState().changeActiveContact;
        const selectedContact =
          useSelectedContactStore.getState().selectedContact;

        if (selectedContact && selectedContact._id === data.contactId) {
          useSelectedContactStore
            .getState()
            .setSelectedContact({
              ...selectedContact,
              isActive: data.isActive,
            });
        }

        changeActiveContact(data.contactId, data.isActive);
      }
    );
  },

  disconnect: () => {
    const socket = useSocketStore.getState().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
      console.log("❌ Socket disconnected");
    }
  },
}));
