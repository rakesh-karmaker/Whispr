import type { SelectedContact } from "@/types/contactTypes";
import Modal from "@mui/material/Modal";
import type { Socket } from "socket.io-client";

export default function DeleteGroupWarning({
  warningOpen,
  setWarningOpen,
  selectedContact,
  socket,
  setOpen,
}: {
  warningOpen: boolean;
  setWarningOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedContact: SelectedContact;
  socket: Socket;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}): React.ReactNode {
  const handleDeleteGroup = () => {
    if (!socket) return;
    socket.emit("delete-group", selectedContact._id);
    setWarningOpen(false);
    setOpen(false);
  };

  return (
    <Modal
      open={warningOpen}
      onClose={() => setWarningOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      className="flex items-center justify-center h-fit min-h-full absolute max-sm:bg-pure-white dark:max-sm:bg-d-dark-gray"
    >
      <div className="w-full max-w-[28.75em] max-xs:max-w-full min-h-fit max-xs:min-h-[100svh] p-7 rounded-lg max-xs:rounded-none bg-pure-white dark:bg-d-dark-gray flex flex-col max-xs:justify-center gap-3 relative">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold dark:text-d-white/90">
            Delete Group
          </h2>
          <p className="text-gray text-sm dark:text-d-white/70">
            This action cannot be undone. This will permanently delete this
            group <b>{selectedContact.name}</b> and remove all of its data from
            our servers. All your images, files, links, and message data will be
            permanently lost.
          </p>
          <p className="bg-red-100 dark:bg-red-200 text-red p-2.5 border-[1px] border-red rounded-md text-sm font-medium">
            Warning: This action cannot be undone
          </p>
          <div className="w-full flex gap-2.5 justify-end items-center mt-2">
            <button
              className="bg-white-2 dark:bg-d-light-dark-gray text-gray dark:text-d-white/80 py-2 px-3 rounded-sm border-[1px] dark:border-d-dark-gray border-gray-300 hover:bg-gray-300 dark:hover:bg-d-dark-gray dark:hover:border-d-light-dark-gray hover:text-gray-800 dark:hover:text-d-white transition-all duration-200 cursor-pointer"
              onClick={() => setWarningOpen(false)}
            >
              Cancel
            </button>
            <button
              className="bg-red text-pure-white py-2 px-3 rounded-sm border-[1px] border-red hover:bg-red-600 hover:text-pure-white transition-all duration-200 cursor-pointer"
              onClick={handleDeleteGroup}
            >
              Delete Group
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
