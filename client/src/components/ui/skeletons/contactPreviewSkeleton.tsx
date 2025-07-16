import AvatarSkeleton from "./avatarSkeleton";

export default function ContactPreviewSkeleton() {
  return (
    <div className="w-full h-fit relative flex justify-center items-center border-none outline-none p-[1.375em] bg-pure-white hover:bg-white-2 transition-all duration-200 cursor-pointer">
      <div className="w-full h-fit flex gap-2.5 relative items-center">
        <AvatarSkeleton />
        <div className="w-full flex flex-col gap-3.5">
          <div className={`w-1/2 h-3 rounded-2xl skeleton`}></div>
          <div className={`w-full h-3 rounded-2xl skeleton`}></div>
        </div>
        <div
          className={
            "absolute -bottom-[22px] w-full h-[1px] bg-[#D8D8D8]/70 transition-all duration-200"
          }
        />
      </div>
    </div>
  );
}
