import type { SearchedContact } from "@/types/contactTypes";
import type React from "react";

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
    <div style={{ position: "relative", width: "200px" }}>
      <div
        style={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          border: "1px solid #ccc",
          backgroundColor: "#fff",
          zIndex: 1000,
          borderRadius: "5px",
          maxHeight: "150px",
          overflowY: "auto",
        }}
      >
        {data.map((option, index) => (
          <label
            key={option._id}
            style={{ display: "block", padding: "5px" }}
            ref={index === data.length - 1 ? lastRef : null}
          >
            <input
              type="checkbox"
              onChange={() => toggleOption(option)}
              className="hidden"
            />
            {option.name}
          </label>
        ))}
      </div>
    </div>
  );
}
