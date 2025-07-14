import { useUser } from "@/hooks/useUser";
import type { QueriedContact } from "@/types/contactTypes";
import type React from "react";
import moment from "moment";
import Avatar from "./avatar";

export default function ContactPreview({
  contactData,
  ref,
}: {
  contactData: QueriedContact;
  ref?: React.Ref<HTMLButtonElement>;
}): React.ReactNode {
  if (!contactData) return null;

  const { user } = useUser();
  const unseen = contactData.lastMessages.filter(
    (message) => !message.seenBy.includes(user?.id as string)
  ).length;
  const lastMessage =
    contactData.lastMessages[0]?.messageType === "text"
      ? contactData.lastMessages[0]?.content
      : contactData.lastMessages[0]?.summary;

  //TODO: Add selected contact state

  return (
    <button
      ref={ref ? ref : null}
      className="w-full h-[5.5em] relative flex justify-center items-center border-none outline-none p-[1.375em] bg-pure-white hover:bg-white-2 transition-all duration-200"
    >
      <div className="w-full h-fit flex gap-2.5">
        <Avatar
          src={contactData.image}
          name={contactData.name}
          isActive={contactData.isGroup ? false : contactData.isActive}
        />
        <div className="flex flex-col">
          <div className="flex justify-between gap-2.5">
            <h4 className="font-medium text-lg">
              {contactData.name.length > 17
                ? contactData.name.slice(0, 17) + "..."
                : contactData.name}
            </h4>
            <p className="font-medium text-xs text-gray">
              {moment(contactData.lastMessages[0]?.createdAt).format("LT")}
            </p>
          </div>
          <p className="flex justify-between gap-2.5">
            <span className="text-sm text-gray">
              {lastMessage.length > 35
                ? lastMessage.slice(0, 35) + "..."
                : lastMessage}
            </span>
            {unseen > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-teal text-pure-white text-xs rounded-full">
                {unseen}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 w-full h-[1px] bg-[#D8D8D8]/70" />
    </button>
  );
}
