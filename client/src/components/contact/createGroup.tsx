import Modal from "@mui/material/Modal";
import type React from "react";
import { useState } from "react";
import { GoPlus } from "react-icons/go";

import ModalHeader from "../ui/modalHeader";
import Tooltip from "@mui/material/Tooltip";
import CreateGroupForm from "../forms/createGroupForm";

export default function CreateGroup(): React.ReactNode {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Create new group" arrow>
        <button
          className="min-w-10 min-h-10 rounded-full bg-teal border-none outline-none flex items-center justify-center cursor-pointer text-pure-white dark:text-d-white transition-all duration-300 hover:bg-white-2 hover:text-black dark:hover:bg-d-light-dark-gray dark:hover:text-d-white"
          onClick={() => setOpen(true)}
          type="button"
          aria-label="Create a new group"
        >
          <GoPlus className="text-3xl" />
        </button>
      </Tooltip>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="flex items-center justify-center h-fit min-h-full absolute max-sm:bg-pure-white dark:max-sm:bg-d-dark-gray"
      >
        <div className="w-full max-w-[28.75em] max-h-[calc(100vh-4rem)] max-md:max-h-screen overflow-y-auto max-sm:max-w-full min-h-fit p-7 rounded-lg max-sm:rounded-none bg-pure-white dark:bg-d-dark-gray flex flex-col items-center gap-3 relative">
          <ModalHeader
            title="Create a new group"
            onClick={() => setOpen(false)}
          />
          <CreateGroupForm setOpen={setOpen} />
        </div>
      </Modal>
    </>
  );
}
