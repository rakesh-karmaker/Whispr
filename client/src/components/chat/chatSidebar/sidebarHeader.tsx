import { useSelectedContact } from "@/hooks/useSelectContact";
import Modal from "@mui/material/Modal";
import moment from "moment";
import type React from "react";
import { useState } from "react";
import { FaGear } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { usePreferences } from "@/hooks/usePreferences";
import UpdateGroupForm from "./updateGroupForm";
import { useUser } from "@/hooks/useUser";

export default function SidebarHeader(): React.ReactNode {
  {
    const { selectedContact } = useSelectedContact();
    const [open, setOpen] = useState<boolean>(false);
    const { setIsSidebarOpen } = usePreferences();
    const { user } = useUser();

    return (
      <div className="w-full flex justify-between items-center gap-3.5">
        <button
          className="hidden max-sm:flex cursor-pointer text-xl text-gray dark:text-d-gray hover:text-black dark:hover:text-d-light-dark-gray transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        >
          <RxCross2 />
        </button>

        <p className="text-gray font-medium dark:text-d-gray">
          {moment(selectedContact.createdAt).format("DD MMM YYYY")}
        </p>
        {selectedContact.isGroup &&
          user &&
          selectedContact.admins.some((admin) => admin._id === user.id) && (
            <>
              <button
                type="button"
                aria-label="open chat settings"
                onClick={() => setOpen(true)}
                className="text-gray dark:text-d-gray hover:text-black dark:hover:text-d-white/65 transition-all duration-300 cursor-pointer text-lg"
              >
                <FaGear />
              </button>
              <Modal
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                className="flex items-center justify-center h-fit min-h-full absolute max-sm:bg-pure-white dark:max-sm:bg-d-dark-gray"
              >
                <div className="w-full max-w-[38.75em] max-sm:max-w-full min-h-fit max-sm:min-h-screen p-10 rounded-lg max-sm:rounded-none bg-pure-white dark:bg-d-dark-gray flex flex-col items-center max-sm:justify-center gap-3 relative">
                  <span
                    className="absolute hidden top-10 right-10 cursor-pointer text-xl font-extrabold w-10 h-10 max-sm:flex items-center justify-center bg-teal text-pure-white rounded-full"
                    onClick={() => setOpen(false)}
                  >
                    &#10005;
                  </span>
                  <h2 className="text-2xl font-semibold text-center dark:text-d-white/90">
                    Change group info
                  </h2>
                  <UpdateGroupForm setOpen={setOpen} />
                </div>
              </Modal>
            </>
          )}
      </div>
    );
  }
}
