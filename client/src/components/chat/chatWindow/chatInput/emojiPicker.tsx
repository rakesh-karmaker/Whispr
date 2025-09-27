import EmojiPicker, {
  EmojiStyle,
  SuggestionMode,
  Theme,
} from "emoji-picker-react";
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
        className="text-md text-gray cursor-pointer hover:text-black dark:hover:text-d-white/90 transition-all duration-200 min-w-10.5 min-h-10.5 max-h-10.5 flex justify-center items-center text-xl bg-white-2 dark:bg-d-light-dark-gray hover:bg-light-gray dark:hover:bg-d-dark-gray rounded-full focus-within:outline-none focus-within:bg-white-2 dark:focus-within:bg-d-dark-gray focus-within:text-black dark:focus-within:text-d-white/90"
      >
        <MdOutlineEmojiEmotions />
      </button>
      <div className="absolute bottom-full right-full">
        <EmojiPicker
          open={open}
          onEmojiClick={(emoji) =>
            setMessage((prevMessage) => prevMessage + emoji.emoji)
          }
          theme={Theme.DARK}
          emojiStyle={EmojiStyle.NATIVE}
          suggestedEmojisMode={SuggestionMode.FREQUENT}
          searchDisabled={true}
        />
      </div>
    </div>
  );
}
