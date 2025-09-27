import { RxCross2 } from "react-icons/rx";

export default function ModalHeader({
  title,
  onClick,
}: {
  title: string;
  onClick: () => void;
}) {
  return (
    <div className="w-full relative flex justify-center items-center mb-3">
      <h2 className="text-xl font-semibold text-center dark:text-d-white">
        {title}
      </h2>
      <button
        className="absolute right-0 min-w-8.5 min-h-8.5 max-h-8.5 max-w-8.5 flex items-center justify-center bg-white-2 dark:bg-d-light-dark-gray text-red rounded-full text-xl hover:bg-red hover:text-pure-white transition-all duration-200 cursor-pointer"
        onClick={onClick}
        aria-label="Close modal"
      >
        <RxCross2 />
      </button>
    </div>
  );
}
