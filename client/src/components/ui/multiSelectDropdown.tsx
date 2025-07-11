import type { SearchedContact } from "@/types/contactTypes";
import type React from "react";
import UserPreview from "./userPreview";

export type Option = {
  id: string;
  name: string;
};

export default function MultiSelectDropdown({
  data,
  setSelected,
  lastRef,
  loading,
}: {
  data: SearchedContact[];
  setSelected: React.Dispatch<React.SetStateAction<Option[]>>;
  lastRef: React.RefCallback<HTMLButtonElement>;
  loading: boolean;
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

  if (data.length === 0) return null;

  return (
    <div className="shadow-sm bg-pure-white z-50 max-h-80 overflow-y-auto rounded-xl">
      {data.map((option, index) => (
        <button
          key={option._id}
          ref={index === data.length - 1 ? lastRef : null}
          className="cursor-pointer block w-full"
          onClick={() => toggleOption(option)}
        >
          <UserPreview contactData={option} />
        </button>
      ))}
      {loading && <p>Loading...</p>}
    </div>
  );
}
