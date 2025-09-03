import { useContactAssetsStore } from "@/stores/useContactAssetsStore";
import { useContactsStore } from "@/stores/useContactsStore";
import { useMessagesStore } from "@/stores/useMessagesStore";
import { useSelectedContactStore } from "@/stores/useSelectedContactStore";
import { useUserStore } from "@/stores/useUserStore";
import type { QueriedContact, SelectedContact } from "@/types/contactTypes";
import type { MessageType, UploadedFile } from "@/types/messageTypes";
import type {
  AddParticipantFunctionProps,
  MakeAdminFunctionProps,
  MessageSawFunctionProps,
  MessageSeenFunctionProps,
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

  if (updatedContact._id === selectedContact?._id) {
    setSelectedContact({ ...selectedContact, ...updatedContact });
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

export function addParticipant(data: AddParticipantFunctionProps) {
  const selectedContact = useSelectedContactStore.getState().selectedContact;
  const setSelectedContact =
    useSelectedContactStore.getState().setSelectedContact;
  const setContacts = useContactsStore.getState().setContacts;

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
}

export function sendMessage(data: MessageType) {
  const setMessages = useMessagesStore.getState().setMessages;
  const selectedContact = useSelectedContactStore.getState().selectedContact;
  const setPinnedContacts = useContactsStore.getState().setPinnedContacts;
  const setContacts = useContactsStore.getState().setContacts;
  const setIsMessageSending = useContactsStore.getState().setIsMessageSending;
  const setImages = useContactAssetsStore.getState().setImages;
  const setFiles = useContactAssetsStore.getState().setFiles;
  const setLinks = useContactAssetsStore.getState().setLinks;
  const setImagesCount = useContactAssetsStore.getState().setImagesCount;
  const setFilesCount = useContactAssetsStore.getState().setFilesCount;
  const setLinksCount = useContactAssetsStore.getState().setLinksCount;
  const imagesCount = useContactAssetsStore.getState().imagesCount;
  const filesCount = useContactAssetsStore.getState().filesCount;
  const linksCount = useContactAssetsStore.getState().linksCount;

  if (selectedContact._id === data.chatId) {
    setMessages((prevMessages) => [...prevMessages, data]);
  }

  const formattedMessage = {
    _id: data._id,
    content: data?.content ?? "",
    messageType: data.messageType,
    seenBy: data.seenBy.map((seenBy) => seenBy.toString()),
    summary: data.summary ?? "",
    updatedAt: data.updatedAt.toString(),
    sender: {
      _id: data.senderDetails._id,
      name: data.senderDetails.name,
      avatar: data.senderDetails.avatar,
    },
  };

  setContacts((prevContacts) => {
    return prevContacts.map((contact) => {
      if (contact._id === data.chatId) {
        return {
          ...contact,
          lastMessages: [formattedMessage, ...contact.lastMessages],
        };
      }
      return contact;
    });
  });

  setPinnedContacts((prevPinnedContacts) => {
    return prevPinnedContacts.map((contact) => {
      if (contact._id === data.chatId) {
        return {
          ...contact,
          lastMessages: [formattedMessage, ...contact.lastMessages],
        };
      }
      return contact;
    });
  });

  setIsMessageSending(false);

  const images: UploadedFile[] = [];
  const files: UploadedFile[] = [];

  data.files?.forEach((file) => {
    if (file.publicId.startsWith("whispr/images/")) {
      images.push({
        url: file.url,
        publicId: file.publicId,
        size: file.size ?? 0,
      });
    } else {
      files.push({
        url: file.url,
        publicId: file.publicId,
        size: file.size ?? 0,
      });
    }
  });

  setImages((prevImages) => [...prevImages, ...images]);
  setFiles((prevFiles) => [...prevFiles, ...files]);

  setImagesCount(imagesCount + images.length);
  setFilesCount(filesCount + files.length);

  if (data.link && data.link.url) {
    setLinksCount(linksCount + 1);
    setLinks((prevLinks) => [
      ...prevLinks,
      {
        messageId: data._id,
        url: data.link?.url || "",
        title: data.link?.title || "",
        description: data.link?.description || "",
        imageURL: data.link?.imageURL || "",
      },
    ]);
  }
}

export function messageSeen(data: MessageSeenFunctionProps) {
  const selectedContact = useSelectedContactStore.getState().selectedContact;
  const setMessages = useMessagesStore.getState().setMessages;

  if (selectedContact._id === data.chatId) {
    setMessages((prevMessages) => {
      return prevMessages.map((message) => {
        if (message._id === data.messageId) {
          return {
            ...message,
            seenBy: [...message.seenBy, data.seenBy],
          };
        }
        return message;
      });
    });
  }
}

export function messageSaw(data: MessageSawFunctionProps) {
  const selectedContact = useSelectedContactStore.getState().selectedContact;
  const setMessages = useMessagesStore.getState().setMessages;
  const setContacts = useContactsStore.getState().setContacts;
  const setPinnedContacts = useContactsStore.getState().setPinnedContacts;
  const user = useUserStore.getState().user;

  if (selectedContact._id === data.chatId) {
    setMessages((prevMessages) => {
      return prevMessages.map((message) => {
        if (data.messageIds.includes(message._id)) {
          return {
            ...message,
            seenBy: [...message.seenBy, ...(user?.id || "")],
          };
        }
        return message;
      });
    });
  }

  setContacts((prevContacts) => {
    return prevContacts.map((contact) => {
      if (contact._id === data.chatId) {
        return {
          ...contact,
          lastMessages: contact.lastMessages.map((message) => {
            if (data.messageIds.includes(message._id)) {
              return {
                ...message,
                seenBy: [...message.seenBy, user?.id || ""],
              };
            }
            return message;
          }),
        };
      }
      return contact;
    });
  });

  setPinnedContacts((prevPinnedContacts) => {
    return prevPinnedContacts.map((contact) => {
      if (contact._id === data.chatId) {
        return {
          ...contact,
          lastMessages: contact.lastMessages.map((message) => {
            if (data.messageIds.includes(message._id)) {
              return {
                ...message,
                seenBy: [...message.seenBy, user?.id || ""],
              };
            }
            return message;
          }),
        };
      }
      return contact;
    });
  });
}
