import type React from "react";
import AvatarSkeleton from "./avatarSkeleton";

export default function UserPreviewSkeleton(): React.ReactNode {
  return (
    <div className="w-full h-full flex p-3 items-center">
      <div className="w-full flex gap-2.5 items-center relative">
        <AvatarSkeleton />

        <div className="w-full flex flex-col gap-3.5">
          <div className={`w-[40%] h-3 rounded-2xl skeleton`}></div>
          <div className={`w-[70%] h-3 rounded-2xl skeleton`}></div>
        </div>
      </div>
    </div>
  );
}
