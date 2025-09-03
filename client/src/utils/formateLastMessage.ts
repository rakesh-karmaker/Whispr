import type { UserType } from "@/types/authTypes";
import type { QueriedContact } from "@/types/contactTypes";

export default function formatLastMessage(
  contactData: QueriedContact,
  user: UserType | null
) {
  const lastMessage = contactData.lastMessages[0];
  const sender =
    lastMessage.sender._id === user?.id
      ? "You"
      : lastMessage.sender.name?.split(" ")[0];

  if (lastMessage) {
    switch (lastMessage.messageType) {
      case "text":
        return `${sender}: ${lastMessage.content}`;
      case "file":
        return `${sender} ${lastMessage.summary}`;
      case "image":
        return `${sender} ${lastMessage.summary}`;
      case "link":
        return `${sender} ${lastMessage.summary}`;
      case "announcement":
        const announcer = contactData.lastMessages[0]?.announcer;
        return announcer == user?.firstName
          ? "You " + contactData.lastMessages[0]?.summary
          : contactData.lastMessages[0]?.announcer +
              " " +
              contactData.lastMessages[0]?.summary;
      case "hybrid":
        return `${sender} ${lastMessage.summary}`;
      default:
        return "No messages yet";
    }
  }
}
