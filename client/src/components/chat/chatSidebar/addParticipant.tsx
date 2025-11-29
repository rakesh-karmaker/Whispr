import { AddParticipantBtn } from "@/components/ui/btns";
import type React from "react";
import { useState } from "react";
import Modal from "@mui/material/Modal";
import ModalHeader from "@/components/ui/modalHeader";
import AddParticipantForm from "@/components/forms/addParticipantForm";

export default function AddParticipant(): React.ReactNode {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <AddParticipantBtn setOpen={setOpen} open={open} />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        className="flex items-center justify-center h-fit min-h-full absolute max-sm:bg-pure-white dark:max-sm:bg-d-dark-gray"
      >
        <div className="w-full max-w-[28.75em] max-sm:max-w-full min-h-99 max-sm:min-h-[100svh] p-7 rounded-lg max-sm:rounded-none bg-pure-white dark:bg-d-dark-gray flex flex-col items-center gap-3 relative">
          <ModalHeader
            title="Add Participants"
            onClick={() => setOpen(false)}
          />
          <AddParticipantForm setOpen={setOpen} />
        </div>
      </Modal>
    </>
  );
}
