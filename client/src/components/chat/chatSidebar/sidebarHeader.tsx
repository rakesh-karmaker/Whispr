import { useSelectedContact } from "@/hooks/useSelectContact";
import Modal from "@mui/material/Modal";
import moment from "moment";
import type React from "react";
import { useState } from "react";
import { FaGear } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { usePreferences } from "@/hooks/usePreferences";
import UpdateGroupForm from "../../forms/updateGroupForm";
import { useUser } from "@/hooks/useUser";
import Tooltip from "@mui/material/Tooltip";
import ModalHeader from "@/components/ui/modalHeader";

export default function SidebarHeader(): React.ReactNode {
  {
    const { selectedContact } = useSelectedContact();
    const [open, setOpen] = useState<boolean>(false);
    const { setIsSidebarOpen } = usePreferences();
    const { user } = useUser();

    return (
      <div className="w-full flex justify-between items-center gap-3.5">
        <Tooltip title="Close sidebar" arrow placement="right">
          <button
            className={`min-w-8.5 min-h-8.5 max-h-8.5 max-w-8.5 flex items-center justify-center bg-white-2 dark:bg-d-light-dark-gray text-red rounded-full text-xl hover:bg-red hover:text-pure-white transition-all duration-200 cursor-pointer`}
            onClick={() => setIsSidebarOpen(false)}
            type="button"
            aria-label="Remove participant"
          >
            <RxCross2 />
          </button>
        </Tooltip>

        <p className="text-gray font-medium dark:text-d-gray">
          {moment(selectedContact.createdAt).format("DD MMM YYYY")}
        </p>
        {selectedContact.isGroup &&
          user &&
          selectedContact.admins.some((admin) => admin._id === user.id) && (
            <>
              <Tooltip title="Group settings" arrow placement="left">
                <button
                  type="button"
                  aria-label="open chat settings"
                  onClick={() => setOpen(true)}
                  className="text-gray dark:text-d-gray hover:text-black dark:hover:text-d-white/65 transition-all duration-300 cursor-pointer text-lg"
                >
                  <FaGear />
                </button>
              </Tooltip>
              <Modal
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                className="flex items-center justify-center h-fit min-h-full absolute max-sm:bg-pure-white dark:max-sm:bg-d-dark-gray"
              >
                <div className="w-full max-w-[38.75em] max-sm:max-w-full min-h-fit max-h-[calc(100svh-4rem)] max-md:max-h-[100svh] overflow-auto max-sm:min-h-[100svh] max-sm:max-h-[100svh] p-7 rounded-lg max-sm:rounded-none bg-pure-white dark:bg-d-dark-gray flex flex-col items-center gap-3 relative">
                  <ModalHeader
                    title="Change group info"
                    onClick={() => setOpen(false)}
                  />
                  <UpdateGroupForm setOpen={setOpen} />
                </div>
              </Modal>
            </>
          )}
      </div>
    );
  }
}
