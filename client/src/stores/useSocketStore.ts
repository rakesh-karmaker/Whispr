import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { SERVER } from "@/config/constants";

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
        console.log("User active status changed:", data);
        // Optionally call another zustand store method if needed
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
