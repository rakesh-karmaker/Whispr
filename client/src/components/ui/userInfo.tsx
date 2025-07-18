import type React from "react";
import Avatar from "./avatar";
import { useUser } from "@/hooks/useUser";
import { FaGear } from "react-icons/fa6";
import { NavLink } from "react-router-dom";

export default function UserInfo(): React.ReactNode {
  const { user } = useUser();
  return (
    <div className="relative w-full p-[1.375em] bg-pure-white rounded-xl flex gap-3 items-center justify-center">
      <div className="w-full flex gap-2.5 justify-between items-center">
        <div className="w-full flex items-center gap-2.5">
          <Avatar
            src={user?.avatar || ""}
            name={user?.name || ""}
            isActive={true}
          />
          <div className="flex flex-col">
            <p className="font-medium text-lg/[130%]">{user?.name}</p>
            <p className="text-sm text-gray">
              {user?.email && user.email.length > 30
                ? user?.email?.slice(0, 30) + "..."
                : user?.email}
            </p>
          </div>
        </div>
        <NavLink
          to="#"
          className="min-w-11 min-h-11 bg-teal text-pure-white text-2xl hover:bg-white-2 hover:text-black transition-all duration-300 rounded-full justify-center items-center flex"
        >
          <FaGear />
        </NavLink>
      </div>
    </div>
  );
}
