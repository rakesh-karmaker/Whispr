import React, { useEffect, useRef } from "react";

export default function ChatInput({
  message,
  setMessage,
  handleMessageSubmit,
}: {
  message: string;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  handleMessageSubmit: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${e.target.value}px`;
    }
  };

  useEffect(() => {
    // Initial resize
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleMessageSubmit();
    }
  };

  return (
    <div className="w-full h-fit rounded-3xl border-[0.5px] border-light-gray flex items-center gap-1.5 px-3">
      <textarea
        ref={textareaRef}
        className="w-full min-h-6 max-h-32 resize-none border-none outline-none overflow-hidden bg-transparent py-2.5 text-sm"
        placeholder="Type a message..."
        value={message}
        onChange={handleMessageChange}
        onKeyDown={handleKeyDown}
        rows={1}
      />
    </div>
  );
}
