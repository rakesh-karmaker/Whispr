import React, { createContext, useContext, useEffect, useRef } from "react";
import { useUser } from "./userContext";
import { io, Socket } from "socket.io-client";
import { SERVER } from "@/config/constants";

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const socket = useRef<Socket | null>(null);
  const userContext = useUser();

  const userInfo = userContext && userContext.user ? userContext.user : null;

  useEffect(() => {
    if (userInfo) {
      socket.current = io(SERVER, {
        withCredentials: true,
        query: { userId: userInfo.id },
      });

      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      return () => {
        if (socket.current) {
          socket.current.disconnect();
        }
      };
    }
  }, [userInfo]);

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
