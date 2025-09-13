import type { SearchedContact } from "@/types/contactTypes";
import type React from "react";
import UserPreview from "./userPreview";
import { useRef } from "react";
import UserPreviewSkeleton from "./skeletons/userPreviewSkeleton";

export type Option = {
  _id: string;
  name: string;
  firstName?: string;
  isActive?: boolean;
  avatar: string;
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
        _id: option._id,
        name: option.name,
        firstName: option.firstName,
        isActive: option.isActive,
        avatar: option.avatar,
      };
      if (!prevSelected.some((selected) => selected._id === option._id)) {
        return [...prevSelected, filteredData];
      } else {
        return prevSelected;
      }
    });
  };
  const dropdownRef = useRef<HTMLDivElement>(null);

  window.addEventListener("click", (event) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      dropdownRef.current.style.display = "none";
    } else {
      dropdownRef.current && (dropdownRef.current.style.display = "block");
    }
  });

  if (data.length === 0 && !loading) return null;

  return (
    <div
      className="shadow-sm dark:shadow-d-light-dark-gray bg-pure-white dark:bg-d-dark-gray z-50 max-h-80 overflow-y-auto rounded-xl"
      ref={dropdownRef}
    >
      {data.map((option, index) => (
        <button
          type="button"
          key={option._id}
          ref={index === data.length - 1 ? lastRef : null}
          className="cursor-pointer block w-full focus-within:bg-white-2 dark:focus-within:bg-d-light-dark-gray"
          onClick={() => toggleOption(option)}
        >
          <UserPreview contactData={option} />
        </button>
      ))}
      {loading ? (
        <>
          <UserPreviewSkeleton />
          <UserPreviewSkeleton />
        </>
      ) : null}
    </div>
  );
}
