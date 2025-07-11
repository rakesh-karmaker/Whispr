import Modal from "@mui/material/Modal";
import type React from "react";
import { useState } from "react";
import { GoPlus } from "react-icons/go";

export default function CreateGroup(): React.ReactNode {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <button
        className="w-[51px] h-[51px] rounded-full bg-teal border-none outline-none flex items-center justify-center cursor-pointer text-pure-white transition-all duration-300 hover:bg-white-2 hover:text-black"
        onClick={handleOpen}
      >
        <GoPlus className="text-4xl" />
      </button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <div className="create-group-modal">Create Group</div>
      </Modal>
    </>
  );
}
