import type React from "react";
import Avatar from "./avatar";
import { useUser } from "@/hooks/useUser";
import { FaGear } from "react-icons/fa6";
import { useColorScheme } from "@mui/material/styles";
// import { logoutUser } from "@/lib/api/auth";

export default function UserInfo(): React.ReactNode {
  const { user } = useUser();
  const { mode, setMode } = useColorScheme();

  // async function toggleButton() {
  //   const res = await logoutUser();
  //   if (res) {
  //     window.location.reload();
  //   }
  // }

  return (
    <div className="relative w-full px-[1.375em] h-[4.75em] bg-pure-white dark:bg-d-dark-gray rounded-xl max-mid:rounded-none flex gap-3 items-center justify-center border-t-2 border-gray/20 dark:border-d-white/10">
      <div className="w-full flex gap-2.5 justify-between items-center">
        <div className="w-full flex items-center gap-2.5">
          <Avatar
            src={user?.avatar || ""}
            name={user?.name || ""}
            isActive={true}
            className="min-w-10 min-h-10.5 max-w-10.5 max-h-10.5"
          />
          <div className="flex flex-col">
            <p className="font-medium text-lg/[130%] dark:text-d-white/90 line-clamp-1 break-all">
              {user?.name}
            </p>
            <p className="text-sm line-clamp-1 text-gray dark:text-d-white/45 break-all">
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => setMode(mode === "dark" ? "light" : "dark")}
          className="min-w-10 min-h-10 bg-teal text-pure-white text-xl hover:bg-white-2 dark:hover:bg-d-light-dark-gray hover:text-black dark:hover:text-white/90 transition-all duration-300 rounded-full justify-center items-center flex cursor-pointer focus-within:bg-d-light-dark-gray"
        >
          <FaGear />
        </button>
        {/* <button
          onClick={toggleButton}
          className="min-w-11 min-h-11 bg-teal text-pure-white text-2xl hover:bg-white-2 dark:hover:bg-d-light-dark-gray hover:text-black dark:hover:text-white/90 transition-all duration-300 rounded-full justify-center items-center flex cursor-pointer focus-within:bg-d-light-dark-gray"
        >
          <FaGear />
        </button> */}
      </div>
    </div>
  );
}
