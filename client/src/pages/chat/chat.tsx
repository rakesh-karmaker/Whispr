import ChatSidebar from "@/components/chat/chatSidebar/chatSidebar";
import ChatWindow from "@/components/chat/chatWindow";
import { useContacts } from "@/hooks/useContacts";
import { useSelectedContact } from "@/hooks/useSelectContact";
import { getContact } from "@/lib/api/contacts";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Chat(): React.ReactNode {
  const navigate = useNavigate();

  const {
    selectedContact,
    setSelectedContact,
    setIsLoading,
    setIsNewSelectedContact,
  } = useSelectedContact();
  const getContactMutation = useMutation({
    mutationFn: (id: string) => getContact(id),
    onSuccess: (res) => {
      if (
        res.contactData &&
        (!selectedContact || res.contactData._id !== selectedContact._id)
      ) {
        setSelectedContact(res.contactData);
        setIsNewSelectedContact(false);
      }
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const { pinnedContacts, contacts } = useContacts();
  const chatId = useParams().chatId;
  useEffect(() => {
    if (!chatId) {
      if (pinnedContacts.length > 0) {
        navigate(`/chat/${pinnedContacts[0]._id}`);
      } else if (contacts.length > 0) {
        navigate(`/chat/${contacts[0]._id}`);
      }
    } else {
      setIsLoading(true);
      getContactMutation.mutate(chatId);
    }
  }, [chatId, pinnedContacts, contacts, navigate]);

  return (
    <div className="w-full h-full flex-1 flex gap-4">
      <ChatWindow />
      <ChatSidebar />
    </div>
  );
}
