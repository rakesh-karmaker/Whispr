import type { Dispatch, ReactNode, SetStateAction } from "react";
import type { Option } from "./multiSelectDropdown";
import { IoPersonAdd } from "react-icons/io5";
import UserPreview from "./userPreview";
import Tooltip from "@mui/material/Tooltip";
import { RxCross2 } from "react-icons/rx";

type AddedPeopleListProps = {
  selected: Option[];
  setSelected: Dispatch<SetStateAction<Option[]>>;
};

export default function AddedPeopleList({
  selected,
  setSelected,
}: AddedPeopleListProps): ReactNode {
  function handleRemoveParticipant(_id: string) {
    setSelected((prevSelected) =>
      prevSelected.filter((person) => person._id !== _id)
    );
  }

  return (
    <div
      className="w-full h-full flex flex-col gap-1 items-center min-h-88 max-h-88 overflow-y-auto"
      style={{
        justifyContent: selected.length > 0 ? "flex-start" : "center",
      }}
    >
      {selected.length === 0 ? (
        <>
          <IoPersonAdd className="text-5xl text-gray/80" />
          <p className="text-gray">Add people</p>
        </>
      ) : (
        <div className="w-full min-h-full flex flex-col">
          {selected.map((person) => (
            <div
              key={person._id}
              className="w-full flex gap-1 px-3 items-center hover:bg-white-2 dark:hover:bg-d-light-dark-gray rounded-lg duration-200 transition-all"
            >
              <UserPreview
                contactData={{ ...person, email: "", isActive: false }}
                className="px-0 pr-0 hover:!bg-transparent"
              />
              <Tooltip title="Remove participant" arrow placement="top">
                <button
                  className={`min-w-8.5 min-h-8.5 max-h-8.5 max-w-8.5 flex items-center justify-center bg-white-2 dark:bg-d-light-dark-gray text-red rounded-full text-xl hover:bg-red hover:text-pure-white transition-all duration-200 cursor-pointer`}
                  onClick={() => handleRemoveParticipant(person._id)}
                  type="button"
                  aria-label="Remove participant"
                >
                  <RxCross2 />
                </button>
              </Tooltip>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
