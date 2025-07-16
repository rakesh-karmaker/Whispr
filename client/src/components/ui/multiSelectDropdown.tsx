import type { SearchedContact } from "@/types/contactTypes";
import type React from "react";
import UserPreview from "./userPreview";
import { useRef } from "react";
import Loader from "./Loader/Loader";
import UserPreviewSkeleton from "./skeletons/userPreviewSkeleton";

export type Option = {
  id: string;
  name: string;
  firstName: string;
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
        firstName: option.firstName,
      };
      if (!prevSelected.some((selected) => selected.id === option._id)) {
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
      className="shadow-sm bg-pure-white z-50 max-h-80 overflow-y-auto rounded-xl"
      ref={dropdownRef}
    >
      {data.map((option, index) => (
        <button
          key={option._id}
          ref={index === data.length - 1 ? lastRef : null}
          className="cursor-pointer block w-full focus-within:bg-white-2"
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
