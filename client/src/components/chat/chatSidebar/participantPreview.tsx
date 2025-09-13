import Avatar from "@/components/ui/avatar";
import type React from "react";
import { BsThreeDots } from "react-icons/bs";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState, memo, useMemo } from "react";
import { useSelectedContact } from "@/hooks/useSelectContact";
import { useUser } from "@/hooks/useUser";
import { useSocketStore } from "@/stores/useSocketStore";
import type { SelectedContact } from "@/types/contactTypes";

export default memo(function ParticipantPreview({
  participant,
  isAdmin,
}: {
  participant: { _id: string; name: string; avatar: string };
  isAdmin: boolean;
}): React.ReactNode {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { selectedContact } = useSelectedContact();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <div className="w-full flex justify-between items-center gap-5 participant-content">
      <div className="flex gap-3 items-center flex-1">
        <Avatar
          src={participant.avatar}
          name={participant.name}
          isActive={false}
        />
        <div className="flex flex-col">
          <p className="font-medium text-lg dark:text-d-white/90">
            {participant.name}
          </p>
          <p className="text-sm text-gray dark:text-d-white/50">
            {isAdmin ? "Admin" : "Member"}
          </p>
        </div>
      </div>
      {selectedContact && selectedContact.isGroup && (
        <>
          <button
            type="button"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-teal text-pure-white hover:bg-white-2 dark:hover:bg-d-light-dark-gray hover:text-black dark:hover:text-d-white cursor-pointer transition-all duration-200"
            onClick={handleClick}
          >
            <BsThreeDots />
          </button>
          <div className="participant-dropdown absolute">
            <ParticipantDropdown
              participant={participant}
              isAdmin={isAdmin}
              anchorEl={anchorEl}
              setAnchorEl={setAnchorEl}
              selectedContact={selectedContact}
            />
          </div>
        </>
      )}
    </div>
  );
});

const ParticipantDropdown = memo(function ParticipantDropdown({
  participant,
  isAdmin,
  anchorEl,
  setAnchorEl,
  selectedContact,
}: {
  participant: { _id: string; name: string; avatar: string };
  isAdmin: boolean;
  anchorEl: null | HTMLElement;
  setAnchorEl: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
  selectedContact: SelectedContact;
}): React.ReactNode {
  const { user } = useUser();
  const socket = useSocketStore((s) => s.socket);

  // Memoize expensive admin check
  const isUserAdmin = useMemo(() => {
    return selectedContact.admins?.some((admin) => admin._id === user?.id);
  }, [selectedContact.admins, user?.id]);

  const open = Boolean(anchorEl);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAdminClick = (makeAdmin: boolean) => {
    if (socket) {
      socket.emit("make-admin", {
        makeAdmin,
        participantId: participant._id,
        contactId: selectedContact._id,
      });
    }
    setAnchorEl(null);
  };

  const handleRemoveClick = () => {
    if (socket) {
      socket.emit("remove-participant", {
        contactId: selectedContact._id,
        participantId: participant._id,
      });
    }
    setAnchorEl(null);
  };

  return (
    <Menu
      anchorEl={anchorEl}
      id="account-menu"
      open={open}
      onClose={handleClose}
      onClick={handleClose}
      slotProps={{
        paper: {
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&::before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        },
      }}
      transformOrigin={{ horizontal: "right", vertical: "top" }}
      anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
    >
      <MenuItem onClick={handleClose} className="!pr-16" key={0}>
        Message
      </MenuItem>

      {isUserAdmin && participant._id !== user?.id && (
        <MenuItem onClick={() => handleAdminClick(!isAdmin)} key={1}>
          {isAdmin ? "Make member" : "Make admin"}
        </MenuItem>
      )}

      <MenuItem onClick={handleRemoveClick} key={2}>
        {isUserAdmin && participant._id === user?.id ? "Leave" : "Remove"}
      </MenuItem>
    </Menu>
  );
});
