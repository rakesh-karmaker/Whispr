import { createContext } from "react";

type MessageContextType = {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
};

const MessageContext = createContext(null);
