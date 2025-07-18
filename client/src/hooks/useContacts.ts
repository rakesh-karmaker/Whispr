import { useContactsStore } from "@/stores/useContactsStore";

export const useContacts = () => {
  const contacts = useContactsStore((s) => s.contacts);
  const setContacts = useContactsStore((s) => s.setContacts);
  const pinnedContacts = useContactsStore((s) => s.pinnedContacts);
  const setPinnedContacts = useContactsStore((s) => s.setPinnedContacts);
  const isLoading = useContactsStore((s) => s.isLoading);
  const setIsLoading = useContactsStore((s) => s.setIsLoading);
  const changeActiveContact = useContactsStore((s) => s.changeActiveContact);

  return {
    contacts,
    setContacts,
    pinnedContacts,
    setPinnedContacts,
    isLoading,
    setIsLoading,
    changeActiveContact,
  };
};
