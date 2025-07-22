import { useContactsStore } from "@/stores/useContactsStore";
import { useSelectedContactStore } from "@/stores/useSelectedContactStore";
import { useUserStore } from "@/stores/useUserStore";
import type { QueriedContact, SelectedContact } from "@/types/contactTypes";
import type {
  MakeAdminFunctionProps,
  RemoveParticipantFunctionProps,
  UpdatedGroupData,
} from "@/types/socketActionTypes";

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

  setContacts((prevContacts) => {
    console.log("update-group", updatedContact);
    const updatedContacts = prevContacts.map((contact) => {
      if (contact._id === updatedContact._id) {
        return {
          ...contact,
          lastMessages: [...contact.lastMessages, updatedContact.announcement],
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
          lastMessages: [...contact.lastMessages, updatedContact.announcement],
          contactName: updatedContact.name,
          contactImage: updatedContact.image,
          updatedAt: updatedContact.updatedAt,
        };
      }
      return contact;
    });
    return updatedPinnedContacts;
  });

  if (updatedContact._id === selectedContact?._id) {
    setSelectedContact({ ...selectedContact, ...updatedContact });
  }
}

export function makeAdmin(data: MakeAdminFunctionProps) {
  const setContacts = useContactsStore.getState().setContacts;
  const setPinnedContacts = useContactsStore.getState().setPinnedContacts;
  const selectedContact = useSelectedContactStore.getState().selectedContact;
  const setSelectedContact =
    useSelectedContactStore.getState().setSelectedContact;

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
  }

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

export function removeParticipant(data: RemoveParticipantFunctionProps) {
  const setContacts = useContactsStore.getState().setContacts;
  const setPinnedContacts = useContactsStore.getState().setPinnedContacts;
  const selectedContact = useSelectedContactStore.getState().selectedContact;
  const setSelectedContact =
    useSelectedContactStore.getState().setSelectedContact;
  const pinnedContacts = useContactsStore.getState().pinnedContacts;
  const contacts = useContactsStore.getState().contacts;
  const user = useUserStore.getState().user;

  let nextSelectedContact: QueriedContact | undefined;

  if (data.participantData._id.toString() === user?.id.toString()) {
    setContacts((prevContacts) =>
      prevContacts.filter((c) => c._id !== data.contactId)
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
    }

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
}
