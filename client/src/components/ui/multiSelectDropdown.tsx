import type { SearchedContact } from "@/types/contactTypes";
import type React from "react";
import UserPreview from "./userPreview";

type Option = {
  id: string;
  name: string;
};

export default function MultiSelectDropdown({
  data,
  setSelected,
  lastRef,
}: {
  data: SearchedContact[];
  setSelected: React.Dispatch<React.SetStateAction<Option[]>>;
  lastRef: React.RefObject<HTMLLabelElement | null>;
}): React.ReactNode {
  const toggleOption = (option: SearchedContact) => {
    setSelected((prevSelected: Option[]) => {
      const filteredData = {
        id: option._id,
        name: option.name,
      };
      if (!prevSelected.some((selected) => selected.id === option._id)) {
        return [...prevSelected, filteredData];
      } else {
        return prevSelected;
      }
    });
  };

  if (!data) return null;

  return (
    <div className="relative w-full max-w-[28.75em]">
      <div className="shadow-md absolute top-full left-0 right-0 border-[1px] border-light-gray bg-pure-white z-50 max-h-80 overflow-y-auto">
        {data.map((option, index) => (
          <label
            key={option._id}
            ref={index === data.length - 1 ? lastRef : null}
            className="cursor-pointer"
          >
            <input
              type="checkbox"
              onChange={() => toggleOption(option)}
              className="hidden"
            />
            <UserPreview contactData={option} />
          </label>
        ))}
      </div>
    </div>
  );
}
