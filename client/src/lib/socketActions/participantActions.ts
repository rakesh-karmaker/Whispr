import { useContactsStore } from "@/stores/useContactsStore";
import { useMessagesStore } from "@/stores/useMessagesStore";
import { useSelectedContactStore } from "@/stores/useSelectedContactStore";
import { useUserStore } from "@/stores/useUserStore";
import type { QueriedContact, SelectedContact } from "@/types/contactTypes";
import type { MessageType } from "@/types/messageTypes";
import type {
  AddParticipantFunctionProps,
  MakeAdminFunctionProps,
  RemoveParticipantFunctionProps,
} from "@/types/socketActionTypes";

export function addParticipant(data: AddParticipantFunctionProps) {
  const selectedContact = useSelectedContactStore.getState().selectedContact;
  const setSelectedContact =
    useSelectedContactStore.getState().setSelectedContact;
  const setContacts = useContactsStore.getState().setContacts;
  const setPinnedContacts = useContactsStore.getState().setPinnedContacts;
  const setMessages = useMessagesStore.getState().setMessages;

  // Update selected contact if it matches the contactId
  if (selectedContact._id === data.contactId) {
    const updatedSelectedContact = selectedContact;
    updatedSelectedContact.participants = [
      ...data.participants.map((participant) => {
        return {
          _id: participant._id,
          name: participant.name,
          avatar: participant.avatar,
        };
      }),
      ...selectedContact.participants,
    ];

    setSelectedContact(updatedSelectedContact);

    // Add announcement message to messages store
    setMessages((prevMessages) => {
      const formattedMessage: MessageType = {
        _id: data.announcement._id,
        chatId: data.contactId,
        content: data.announcement.content,
        messageType: data.announcement.messageType,
        seenBy: data.announcement.seenBy,
        summary: data.announcement.summary,
        updatedAt: new Date(data.announcement.updatedAt),
        createdAt: new Date(data.announcement.createdAt),
        announcer: data.announcement.announcer,
        senderDetails: {
          _id: data.announcement.sender._id,
          name: "",
          avatar: "",
        },
      };
      return [...prevMessages, formattedMessage];
    });
  }

  // Update contacts list
  setContacts((prevContacts) => {
    let updatedContact: (typeof prevContacts)[number] | null = null;

    const filteredContacts = prevContacts.filter((contact) => {
      if (contact._id === data.contactId) {
        updatedContact = {
          ...contact,
          updatedAt: data.updatedAt,
          lastMessages: [data.announcement, ...contact.lastMessages],
        };
        return false; // remove it, we'll move it to the top
      }
      return true;
    });

    return updatedContact
      ? [updatedContact, ...filteredContacts]
      : prevContacts;
  });

  setPinnedContacts((prevPinnedContacts) => {
    let updatedContact: (typeof prevPinnedContacts)[number] | null = null;

    const filteredContacts = prevPinnedContacts.filter((contact) => {
      if (contact._id === data.contactId) {
        updatedContact = {
          ...contact,
          updatedAt: data.updatedAt,
          lastMessages: [data.announcement, ...contact.lastMessages],
        };
        return false; // remove it, we'll move it to the top
      }
      return true;
    });

    return updatedContact
      ? [updatedContact, ...filteredContacts]
      : prevPinnedContacts;
  });
}

export function makeAdmin(data: MakeAdminFunctionProps) {
  const setContacts = useContactsStore.getState().setContacts;
  const setPinnedContacts = useContactsStore.getState().setPinnedContacts;
  const selectedContact = useSelectedContactStore.getState().selectedContact;
  const setSelectedContact =
    useSelectedContactStore.getState().setSelectedContact;
  const setMessages = useMessagesStore.getState().setMessages;

  // Update selected contact if it matches the contactId
  if (selectedContact._id === data.contactId) {
    const updatedSelectedContact = selectedContact;
    if (data.makeAdmin) {
      updatedSelectedContact.admins.push(data.participantData);
      updatedSelectedContact.participants =
        updatedSelectedContact.participants.filter(
          (participant) =>
            participant._id.toString() !== data.participantData._id.toString()
        );
    } else {
      updatedSelectedContact.admins = updatedSelectedContact.admins.filter(
        (admin) => admin._id.toString() !== data.participantData._id.toString()
      );
      updatedSelectedContact.participants.push(data.participantData);
    }

    setSelectedContact(updatedSelectedContact);

    // Add announcement message to messages store
    setMessages((prevMessages) => {
      const formattedMessage: MessageType = {
        _id: data.announcement._id,
        chatId: data.contactId,
        content: data.announcement.content,
        messageType: data.announcement.messageType,
        seenBy: data.announcement.seenBy,
        summary: data.announcement.summary,
        updatedAt: new Date(data.announcement.updatedAt),
        createdAt: new Date(data.announcement.createdAt),
        announcer: data.announcement.announcer,
        senderDetails: {
          _id: data.announcement.sender._id,
          name: "",
          avatar: "",
        },
      };
      return [...prevMessages, formattedMessage];
    });
  }

  // Update contacts list
  setContacts((prevContacts) => {
    let updatedContact: (typeof prevContacts)[number] | null = null;

    const filteredContacts = prevContacts.filter((contact) => {
      if (contact._id === data.contactId) {
        updatedContact = {
          ...contact,
          updatedAt: data.updatedAt,
          lastMessages: [data.announcement, ...contact.lastMessages],
        };
        return false; // remove it, we'll move it to the top
      }
      return true;
    });

    return updatedContact
      ? [updatedContact, ...filteredContacts]
      : prevContacts;
  });

  // Update pinned contacts list
  setPinnedContacts((prevPinnedContacts) => {
    let updatedContact: (typeof prevPinnedContacts)[number] | null = null;

    const filteredContacts = prevPinnedContacts.filter((contact) => {
      if (contact._id === data.contactId) {
        updatedContact = {
          ...contact,
          updatedAt: data.updatedAt,
          lastMessages: [data.announcement, ...contact.lastMessages],
        };
        return false; // remove it, we'll move it to the top
      }
      return true;
    });

    return updatedContact
      ? [updatedContact, ...filteredContacts]
      : prevPinnedContacts;
  });
}

export function removeParticipant(data: RemoveParticipantFunctionProps) {
  const setContacts = useContactsStore.getState().setContacts;
  const setPinnedContacts = useContactsStore.getState().setPinnedContacts;
  const selectedContact = useSelectedContactStore.getState().selectedContact;
  const setSelectedContact =
    useSelectedContactStore.getState().setSelectedContact;
  const pinnedContacts = useContactsStore.getState().pinnedContacts;
  const contacts = useContactsStore.getState().contacts;
  const user = useUserStore.getState().user;
  const setMessages = useMessagesStore.getState().setMessages;

  let nextSelectedContact: QueriedContact | undefined;

  // If the removed participant is the current user, remove the group from contacts
  if (data.participantData._id.toString() === user?.id.toString()) {
    setContacts((prevContacts) =>
      prevContacts.filter((c) => c._id !== data.contactId)
    );
    setPinnedContacts((prevPinnedContacts) =>
      prevPinnedContacts.filter((c) => c._id !== data.contactId)
    );
    if (
      selectedContact &&
      selectedContact._id.toString() === data.contactId.toString()
    ) {
      setSelectedContact({} as SelectedContact);
      nextSelectedContact = [...pinnedContacts, ...contacts].find(
        (c) => c._id.toString() !== data.contactId.toString()
      );
    }

    return nextSelectedContact;
  } else {
    // Update selected contact if it matches the contactId
    if (selectedContact._id === data.contactId) {
      const updatedSelectedContact = selectedContact;
      updatedSelectedContact.participants =
        updatedSelectedContact.participants.filter(
          (participant) =>
            participant._id.toString() !== data.participantData._id.toString()
        );
      updatedSelectedContact.admins = updatedSelectedContact.admins.filter(
        (admin) => admin._id.toString() !== data.participantData._id.toString()
      );
      setSelectedContact(updatedSelectedContact);

      // Add announcement message to messages store
      setMessages((prevMessages) => {
        const formattedMessage: MessageType = {
          _id: data.announcement._id,
          chatId: data.contactId,
          content: data.announcement.content,
          messageType: data.announcement.messageType,
          seenBy: data.announcement.seenBy,
          summary: data.announcement.summary,
          updatedAt: new Date(data.announcement.updatedAt),
          createdAt: new Date(data.announcement.createdAt),
          announcer: data.announcement.announcer,
          senderDetails: {
            _id: data.announcement.sender._id,
            name: "",
            avatar: "",
          },
        };
        return [...prevMessages, formattedMessage];
      });
    }

    // Update contacts list
    setContacts((prevContacts) => {
      let updatedContact: (typeof prevContacts)[number] | null = null;

      const filteredContacts = prevContacts.filter((contact) => {
        if (contact._id === data.contactId) {
          updatedContact = {
            ...contact,
            updatedAt: data.updatedAt,
            lastMessages: [data.announcement, ...contact.lastMessages],
          };
          return false; // remove it, we'll move it to the top
        }
        return true;
      });

      return updatedContact
        ? [updatedContact, ...filteredContacts]
        : prevContacts;
    });

    // Update pinned contacts list
    setPinnedContacts((prevPinnedContacts) => {
      let updatedContact: (typeof prevPinnedContacts)[number] | null = null;

      const filteredContacts = prevPinnedContacts.filter((contact) => {
        if (contact._id === data.contactId) {
          updatedContact = {
            ...contact,
            updatedAt: data.updatedAt,
            lastMessages: [data.announcement, ...contact.lastMessages],
          };
          return false; // remove it, we'll move it to the top
        }
        return true;
      });

      return updatedContact
        ? [updatedContact, ...filteredContacts]
        : prevPinnedContacts;
    });
  }
}
