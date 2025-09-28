import { useContactsStore } from "@/stores/useContactsStore";
import { useMessagesStore } from "@/stores/useMessagesStore";
import { useSelectedContactStore } from "@/stores/useSelectedContactStore";
import type { QueriedContact } from "@/types/contactTypes";
import type { MessageType } from "@/types/messageTypes";
import type { UpdatedGroupData } from "@/types/socketActionTypes";

export function addContact(contactData: QueriedContact) {
  const setContact = useContactsStore.getState().setContacts;
  setContact((prevContacts) => [contactData, ...prevContacts]);
}

export function updateContact(updatedContact: UpdatedGroupData) {
  const setContacts = useContactsStore.getState().setContacts;
  const setPinnedContacts = useContactsStore.getState().setPinnedContacts;

  const setSelectedContact =
    useSelectedContactStore.getState().setSelectedContact;
  const selectedContact = useSelectedContactStore.getState().selectedContact;
  const setMessages = useMessagesStore.getState().setMessages;

  setContacts((prevContacts) => {
    const updatedContacts = prevContacts.map((contact) => {
      if (contact._id === updatedContact._id) {
        return {
          ...contact,
          lastMessages: [
            updatedContact.updatedMessage,
            ...contact.lastMessages,
          ],
          contactName: updatedContact.name,
          contactImage: updatedContact.image,
          updatedAt: updatedContact.updatedAt,
        };
      }
      return contact;
    });
    return updatedContacts;
  });

  setPinnedContacts((prevPinnedContacts) => {
    const updatedPinnedContacts = prevPinnedContacts.map((contact) => {
      if (contact._id === updatedContact._id) {
        return {
          ...contact,
          lastMessages: [
            updatedContact.updatedMessage,
            ...contact.lastMessages,
          ],
          contactName: updatedContact.name,
          contactImage: updatedContact.image,
          updatedAt: updatedContact.updatedAt,
        };
      }
      return contact;
    });
    return updatedPinnedContacts;
  });

  // update selected contact if it's the same contact
  if (updatedContact._id === selectedContact?._id) {
    setSelectedContact({ ...selectedContact, ...updatedContact });
    setMessages((prevMessages) => {
      const formattedMessage: MessageType = {
        _id: updatedContact.updatedMessage._id,
        chatId: updatedContact._id,
        content: updatedContact.updatedMessage.content,
        messageType: updatedContact.updatedMessage.messageType,
        seenBy: updatedContact.updatedMessage.seenBy,
        summary: updatedContact.updatedMessage.summary,
        updatedAt: new Date(updatedContact.updatedMessage.updatedAt),
        createdAt: new Date(updatedContact.updatedMessage.createdAt),
        announcer: updatedContact.updatedMessage.announcer,
        senderDetails: {
          _id: updatedContact.updatedMessage.sender._id,
          name: "",
          avatar: "",
        },
      };
      return [...prevMessages, formattedMessage];
    });
  }
}

export function deleteGroup(contactId: string) {
  const pinnedContacts = useContactsStore.getState().pinnedContacts;
  const contacts = useContactsStore.getState().contacts;
  const setContacts = useContactsStore.getState().setContacts;
  const setPinnedContacts = useContactsStore.getState().setPinnedContacts;
  const selectedContact = useSelectedContactStore.getState().selectedContact;

  let nextSelectedContact: QueriedContact | undefined;

  if (selectedContact && selectedContact._id == contactId) {
    nextSelectedContact = [...pinnedContacts, ...contacts].find(
      (c) => c._id.toString() !== contactId.toString()
    );
  }

  setContacts((prevContacts) =>
    prevContacts.filter((contact) => contact._id !== contactId)
  );

  setPinnedContacts((prevPinnedContacts) =>
    prevPinnedContacts.filter((contact) => contact._id !== contactId)
  );

  return nextSelectedContact;
}
