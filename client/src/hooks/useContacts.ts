import {
  useContactsStore,
  type ContactsStateType,
} from "@/stores/useContactsStore";

export function useContacts(): ContactsStateType {
  const contacts = useContactsStore.getState().contacts;
  const setContacts = useContactsStore.getState().setContacts;
  const pinnedContacts = useContactsStore.getState().pinnedContacts;
  const setPinnedContacts = useContactsStore.getState().setPinnedContacts;
  const changeActiveContact = useContactsStore.getState().changeActiveContact;
  const isLoading = useContactsStore.getState().isLoading;
  const setIsLoading = useContactsStore.getState().setIsLoading;

  return {
    contacts,
    setContacts,
    pinnedContacts,
    setPinnedContacts,
    changeActiveContact,
    isLoading,
    setIsLoading,
  };
}
