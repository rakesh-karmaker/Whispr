import Avatar from "@/components/ui/avatar";
import type React from "react";
import { BsThreeDots } from "react-icons/bs";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import { useSelectedContact } from "@/hooks/useSelectContact";
import { useUser } from "@/hooks/useUser";
import { useSocketStore } from "@/stores/useSocketStore";

export default function ParticipantPreview({
  participant,
  isAdmin,
}: {
  participant: { _id: string; name: string; avatar: string };
  isAdmin: boolean;
}): React.ReactNode {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <div className="w-full flex justify-between items-center gap-5">
      <div className="flex gap-3 items-center">
        <Avatar
          src={participant.avatar}
          name={participant.name}
          isActive={false}
        />
        <div className="flex flex-col">
          <p className="font-medium text-lg">{participant.name}</p>
          <p className="text-sm text-gray">{isAdmin ? "Admin" : "Member"}</p>
        </div>
      </div>
      <button
        type="button"
        className="w-8 h-8 rounded-full flex items-center justify-center bg-teal text-pure-white hover:bg-white-2 hover:text-black cursor-pointer transition-all duration-200"
        onClick={handleClick}
      >
        <BsThreeDots />
      </button>
      <ParticipantDropdown
        participant={participant}
        isAdmin={isAdmin}
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
      />
    </div>
  );
}

function ParticipantDropdown({
  participant,
  isAdmin,
  anchorEl,
  setAnchorEl,
}: {
  participant: { _id: string; name: string; avatar: string };
  isAdmin: boolean;
  anchorEl: null | HTMLElement;
  setAnchorEl: React.Dispatch<React.SetStateAction<null | HTMLElement>>;
}): React.ReactNode {
  const { selectedContact } = useSelectedContact();
  const { user } = useUser();
  const socket = useSocketStore((s) => s.socket);

  const isUserAdmin = selectedContact.admins?.some(
    (admin) => admin._id === user?.id
  );

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

      {isUserAdmin && participant._id === user?.id && (
        <MenuItem onClick={handleClose} key={2}>
          Leave
        </MenuItem>
      )}

      {isUserAdmin && participant._id !== user?.id && (
        <MenuItem onClick={handleClose} key={3}>
          Remove
        </MenuItem>
      )}
    </Menu>
  );
}
