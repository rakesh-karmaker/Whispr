import React, { createContext, useContext, useEffect, useRef } from "react";
import { useUser } from "./userContext";
import { io, Socket } from "socket.io-client";
import { SERVER } from "@/config/constants";
import { useContacts } from "./contactsContext";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useRef<Socket | null>(null);
  const { user } = useUser();
  const { changeActiveContact } = useContacts();

  useEffect(() => {
    if (user) {
      socket.current = io(SERVER, {
        withCredentials: true,
        query: { userId: user.id },
      });

      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      socket.current.on(
        "updateUserActiveStatus",
        (data: { contactId: string; isActive: boolean }) => {
          changeActiveContact(data.contactId, data.isActive);
        }
      );

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }

  return context;
};
