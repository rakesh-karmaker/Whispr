import type { MessageType } from "@/types/messageTypes";
import { create } from "zustand";

export type MessagesStateType = {
  messages: MessageType[];
  setMessages: (
    messages: MessageType[] | ((prev: MessageType[]) => MessageType[])
  ) => void;
};

export const useMessagesStore = create<MessagesStateType>((set) => ({
  messages: [],
  setMessages: (messagesOrFn) =>
    set((state) => ({
      messages:
        typeof messagesOrFn === "function"
          ? messagesOrFn(state.messages)
          : messagesOrFn,
    })),
}));
