import { useMessagesStore } from "@/stores/useMessagesStore";

export default function useMessages() {
  const messages = useMessagesStore((state) => state.messages);
  const setMessages = useMessagesStore((state) => state.setMessages);

  return {
    messages,
    setMessages,
  };
}
