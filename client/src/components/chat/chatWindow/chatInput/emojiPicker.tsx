import EmojiPicker from "emoji-picker-react";
import { useEffect, useState } from "react";
import { MdOutlineEmojiEmotions } from "react-icons/md";

export default function EmojiPickerContainer({
  setMessage,
}: {
  setMessage: React.Dispatch<React.SetStateAction<string>>;
}) {
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".emoji-picker-container")) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative emoji-picker-container">
      <button
        type="submit"
        aria-label="Send message"
        onClick={() => setOpen(!open)}
        className="text-md text-gray cursor-pointer hover:text-black transition-all duration-200 min-w-10.5 min-h-10.5 max-h-10.5 flex justify-center items-center text-xl bg-white-2 hover:bg-light-gray  rounded-full focus-within:outline-none focus-within:bg-white-2 focus-within:text-black"
      >
        <MdOutlineEmojiEmotions />
      </button>
      <div className="absolute bottom-full right-full">
        <EmojiPicker
          open={open}
          onEmojiClick={(emoji) =>
            setMessage((prevMessage) => prevMessage + emoji.emoji)
          }
        />
      </div>
    </div>
  );
}
