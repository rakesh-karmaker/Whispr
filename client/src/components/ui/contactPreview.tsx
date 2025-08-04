import { useUser } from "@/hooks/useUser";
import type { QueriedContact } from "@/types/contactTypes";
import type React from "react";
import moment from "moment";
import Avatar from "./avatar";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelectedContact } from "@/hooks/useSelectContact";

export default function ContactPreview({
  contactData,
  ref,
}: {
  contactData: QueriedContact;
  ref?: React.Ref<HTMLAnchorElement>;
}): React.ReactNode {
  if (!contactData) return null;

  const [showLine, setShowLine] = useState<boolean>(true);
  const [isActive, setIsActive] = useState<boolean>(false);

  const { user } = useUser();
  const unseen = contactData.lastMessages.filter(
    (message) => !message.seenBy.includes(user?.id as string)
  ).length;

  const renderLastMessage = (contactData: QueriedContact) => {
    const lastMessage = contactData.lastMessages[0];
    if (lastMessage) {
      switch (lastMessage.messageType) {
        case "text":
          return lastMessage.content;
        case "file":
          return lastMessage.summary;
        case "image":
          return lastMessage.summary;
        case "link":
          return lastMessage.summary;
        case "announcement":
          const announcer = contactData.lastMessages[0]?.announcer;
          return announcer == user?.firstName
            ? "You " + contactData.lastMessages[0]?.summary
            : contactData.lastMessages[0]?.announcer +
                " " +
                contactData.lastMessages[0]?.summary;
        case "hybrid":
          const name = lastMessage.summary.split(" ")[0];
          return name === user?.firstName
            ? "You " + lastMessage.summary.slice(name.length + 1)
            : lastMessage.summary;
        default:
          return "No messages yet";
      }
    }
  };

  const lastMessage = renderLastMessage(contactData);

  const { selectedContact } = useSelectedContact();
  useEffect(() => {
    if (selectedContact?._id === contactData._id) {
      setIsActive(true);
      setShowLine(false);
    } else {
      setIsActive(false);
      setShowLine(true);
    }
  }, [selectedContact]);

  return (
    <NavLink
      ref={ref ? ref : null}
      className={
        "w-full h-fit relative flex justify-center items-center border-none outline-none px-[1.375em] py-4.5 bg-pure-white hover:bg-white-2 transition-all duration-200 cursor-pointer" +
        (isActive ? " bg-white-2" : "")
      }
      to={`/chat/${contactData._id}`}
      onMouseEnter={() => {
        !isActive && setShowLine(false);
      }}
      onMouseLeave={() => {
        !isActive && setShowLine(true);
      }}
    >
      <div className="w-full h-fit flex gap-2.5 relative">
        <Avatar
          src={contactData.contactImage}
          name={contactData.contactName}
          isActive={contactData.isGroup ? false : contactData.isActive}
        />
        <div className="w-full flex flex-col">
          <div className="flex justify-between items-center gap-2.5">
            <h4 className="font-medium text-md">
              {contactData.contactName && contactData.contactName.length > 17
                ? contactData.contactName.slice(0, 17) + "..."
                : contactData.contactName}
            </h4>
            <p className="font-medium text-xs text-gray">
              {moment(contactData.lastMessages[0].updatedAt).format("LT")}
            </p>
          </div>
          <p className="flex justify-between gap-2.5">
            <span className="text-sm text-gray">
              {lastMessage && lastMessage.length > 35
                ? lastMessage.slice(0, 35) + "..."
                : lastMessage}
            </span>
            {unseen > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-teal text-pure-white text-[0.625em] rounded-full">
                {unseen > 9 ? "9+" : unseen}
              </span>
            )}
          </p>
        </div>
        <div
          className={
            "absolute -bottom-[40%] w-full h-[1px] bg-[#D8D8D8]/70 transition-all duration-200" +
            (showLine ? "" : " opacity-0")
          }
        />
      </div>
    </NavLink>
  );
}
