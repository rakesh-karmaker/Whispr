import { useUser } from "@/hooks/useUser";
import type { QueriedContact } from "@/types/contactTypes";
import type React from "react";
import moment from "moment";
import Avatar from "./avatar";
import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSelectedContact } from "@/hooks/useSelectContact";
import formatLastMessage from "@/utils/formateLastMessage";

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
  let unseen = 0;
  for (const message of contactData.lastMessages) {
    if (message.sender._id == user?.id) {
      break;
    }
    if (!message.seenBy.includes(user?.id || "")) {
      unseen++;
    }
  }

  const lastMessage = formatLastMessage(contactData, user);

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
        "w-full h-fit relative flex justify-center items-center border-none outline-none px-[1.375em] py-4.5 bg-pure-white dark:bg-d-dark-gray hover:bg-white-2 dark:hover:bg-d-light-dark-gray focus-within:bg-d-light-dark-gray transition-all duration-200 cursor-pointer" +
        (isActive ? " bg-white-2 dark:bg-d-light-dark-gray" : "")
      }
      to={`/chat/${contactData._id}`}
      onMouseEnter={() => {
        !isActive && setShowLine(false);
      }}
      onMouseLeave={() => {
        !isActive && setShowLine(true);
      }}
      onFocus={() => {
        !isActive && setShowLine(false);
      }}
      onBlur={() => {
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
            <h4 className="font-medium text-md line-clamp-1 dark:text-d-white/90">
              {contactData.contactName}
            </h4>
            <p className="font-medium text-xs text-gray min-w-fit dark:text-d-white/50">
              {moment(contactData.lastMessages[0].updatedAt).format("LT")}
            </p>
          </div>
          <p className="flex justify-between gap-2.5">
            <span className="text-sm text-gray line-clamp-1 dark:text-d-white/50">
              {lastMessage}
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
            "absolute -bottom-[40%] w-full h-[1px] bg-[#D8D8D8]/70 dark:bg-d-light-dark-gray/90 transition-all duration-200" +
            (showLine ? "" : " opacity-0")
          }
        />
      </div>
    </NavLink>
  );
}
