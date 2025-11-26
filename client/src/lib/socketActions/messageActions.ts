import { useContactAssetsStore } from "@/stores/useContactAssetsStore";
import { useContactsStore } from "@/stores/useContactsStore";
import { useMessagesStore } from "@/stores/useMessagesStore";
import { useSelectedContactStore } from "@/stores/useSelectedContactStore";
import { useUserStore } from "@/stores/useUserStore";
import type { MessageType, UploadedFile } from "@/types/messageTypes";
import type {
  MessageSawFunctionProps,
  MessageSeenFunctionProps,
} from "@/types/socketActionTypes";

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
