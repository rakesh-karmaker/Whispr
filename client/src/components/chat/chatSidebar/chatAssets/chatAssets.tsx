import type React from "react";
import { useEffect, useState } from "react";
import { FaChevronDown, FaFile } from "react-icons/fa";
import Photos from "./photos";
import { useContactAssets } from "@/hooks/useContactAssets";
import { useSelectedContact } from "@/hooks/useSelectContact";
import { PiImageSquareFill, PiLinkSimpleBold } from "react-icons/pi";
import Links from "./links";

export default function ChatAssets(): React.ReactNode {
  const { imagesCount, linksCount, filesCount } = useContactAssets();
  return (
    <div className="w-full h-full flex flex-col gap-4 relative mt-5">
      <AssetsLayout
        title="Documents"
        subTitle={`${filesCount} files`}
        logo={<FaFile className="text-blue text-2xl" />}
        color="bg-light-blue"
      >
        <Links />
      </AssetsLayout>
      <AssetsLayout
        title="Photos"
        subTitle={`${imagesCount} files`}
        logo={<PiImageSquareFill className="text-teal text-3xl" />}
        color="bg-light-teal"
      >
        <Photos />
      </AssetsLayout>
      <AssetsLayout
        title="Links"
        subTitle={`${linksCount} URLs`}
        logo={<PiLinkSimpleBold className="text-tan text-2xl" />}
        color="bg-light-beige"
      >
        <Links />
      </AssetsLayout>
      <div className="absolute -top-5 w-full h-[1px] bg-[#D8D8D8]/70 transition-all duration-200" />
    </div>
  );
}

function AssetsLayout({
  logo,
  title,
  subTitle,
  children,
  color = "bg-gray-200",
}: {
  logo: React.ReactNode;
  title: string;
  subTitle: string;
  children: React.ReactNode;
  color?: string;
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
        className={`w-full flex justify-between items-center cursor-pointer hover:bg-white-2 transition-all pr-2 duration-200 rounded-md ${
          open ? "bg-white-2" : ""
        }`}
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-15 aspect-square ${color} rounded-md flex justify-center items-center`}
          >
            {logo}
          </div>
          <p className="flex flex-col items-start">
            <span className="font-semibold text-lg">{title}</span>
            <span className="text-gray-500 text-sm">{subTitle}</span>
          </p>
        </div>
        <FaChevronDown
          className={`text-lg text-gray-500 transition-all duration-200 hover:text-black cursor-pointer ${
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
