import { getUser } from "@/lib/api/auth";
import type { UserType } from "@/types/authTypes";
import { useQuery } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  user: UserType | null;
  setUser: React.Dispatch<React.SetStateAction<UserType | null>>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactNode => {
  const [user, setUser] = useState<UserType | null>(null);

  const { data, error, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: getUser,
  });

  if (error) console.log(error);

  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType | null => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within a AuthProvider");
  }

  return context;
};
