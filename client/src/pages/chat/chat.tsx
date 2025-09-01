import ChatSidebar from "@/components/chat/chatSidebar/chatSidebar";
import ChatWindow from "@/components/chat/chatWindow/chatWindow";
import { useContactAssets } from "@/hooks/useContactAssets";
import { useContacts } from "@/hooks/useContacts";
import { useSelectedContact } from "@/hooks/useSelectContact";
import { getContact } from "@/lib/api/contacts";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Chat(): React.ReactNode {
  const navigate = useNavigate();
  const [showChat, setShowChat] = useState(false);

  const { pinnedContacts, contacts, setIsMessageSending } = useContacts();
  const { setImagesCount, setFilesCount, setLinksCount, reset } =
    useContactAssets();
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
        reset();
        setSelectedContact(res.contactData);
        setImagesCount(res.imagesCount);
        setFilesCount(res.filesCount);
        setLinksCount(res.linksCount);
        setIsNewSelectedContact(false);
        setShowChat(true);
        setIsMessageSending(false);
      }
    },
    onError: (err) => {
      const axiosError = err as AxiosError<{ message?: string }>;
      if (axiosError.status === 403 && axiosError.response?.data?.message) {
        setShowChat(false);
      }
      if (axiosError.status === 404) {
        navigate("/chat");
      }
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const chatId = useParams().chatId;
  useEffect(() => {
    if (!chatId) {
      if (pinnedContacts.length > 0) {
        navigate(`/chat/${pinnedContacts[0]._id}`);
      } else if (contacts.length > 0) {
        navigate(`/chat/${contacts[0]._id}`);
      } else {
        setShowChat(false);
      }
    } else {
      setIsLoading(true);
      getContactMutation.mutate(chatId);
    }
  }, [chatId, pinnedContacts, contacts, navigate]);

  if (!showChat) return null;

  return (
    <div className="w-full h-full flex gap-4">
      <ChatWindow />
      <ChatSidebar />
    </div>
  );
}
