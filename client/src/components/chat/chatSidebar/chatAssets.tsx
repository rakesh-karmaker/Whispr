import type React from "react";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import Photos from "./photos";
import { useContactAssets } from "@/hooks/useContactAssets";
import { useSelectedContact } from "@/hooks/useSelectContact";

export default function ChatAssets(): React.ReactNode {
  const { imagesCount } = useContactAssets();
  return (
    <div className="w-full h-full flex flex-col gap-4 relative mt-5">
      <AssetsLayout title="Photos" number={imagesCount} logo={<></>}>
        <Photos />
      </AssetsLayout>
      <div className="absolute -top-5 w-full h-[1px] bg-[#D8D8D8]/70 transition-all duration-200" />
    </div>
  );
}

function AssetsLayout({
  logo,
  title,
  number,
  children,
}: {
  logo: React.ReactNode;
  title: string;
  number: number;
  children: React.ReactNode;
}): React.ReactNode {
  const [open, setOpen] = useState<boolean>(false);
  const { selectedContact } = useSelectedContact();
  useEffect(() => {
    setOpen(false);
  }, [selectedContact._id]);

  return (
    <div className="w-full flex flex-col">
      <button
        type="button"
        className="w-full flex justify-between items-center"
      >
        <div
          className="w-full flex items-center gap-2.5 text-gray cursor-pointer hover:text-black transition-all duration-200"
          onClick={() => setOpen(!open)}
        >
          {logo}
          <p className="text-sm flex items-center gap-1">
            <span className="font-semibold">{number}</span>
            <span className="font-semibold">{title}</span>
          </p>
        </div>
        <FaChevronDown
          className={`text-lg text-gray transition-all duration-200 hover:text-black cursor-pointer ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`w-full grid [grid-template-rows:_0fr] transition-all ease-in-out duration-200 ${
          open ? "grid-rows-1 pt-1.5" : ""
        }`}
      >
        {open && children}
      </div>
    </div>
  );
}
