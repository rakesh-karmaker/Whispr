import type React from "react";
import { useRef, useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { MdEdit } from "react-icons/md";

export default function ImageInput({
  register,
  errorMessage,
  image,
}: {
  register: UseFormRegisterReturn;
  errorMessage?: string;
  image?: string;
}): React.ReactNode {
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const [hasImage, setHasImage] = useState<boolean>(image ? true : false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) {
      if (labelRef.current) {
        setHasImage(true);
        const imageUrl = URL.createObjectURL(e.target.files[0]);
        labelRef.current.style.background = `url(${imageUrl}) no-repeat center center / cover`;
      }
    } else {
      if (labelRef.current) {
        labelRef.current.innerHTML = "File Required";
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-1 flex-wrap">
      <input
        {...register}
        id="file"
        className="hidden"
        type="file"
        accept="image/*"
        onInput={(e) =>
          handleFileInput(e as React.ChangeEvent<HTMLInputElement>)
        }
      />
      <label
        ref={labelRef}
        htmlFor="file"
        className={
          "cursor-pointer relative w-36 h-36 bg-white-2 flex justify-center items-center py-2.5 px-5 [box-shadow:rgba(0,0,0,0.02)_0px_1px_3px_0px,_rgba(27,_31,_35,_0.15)_0px_0px_0px_1px] rounded-full transition-all duration-200 " +
          (image
            ? "[background:url('" +
              image +
              "')_no-repeat_center_center_/_cover]"
            : "")
        }
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <MdEdit
          className={
            "text-6xl relative z-10 text-black transition-all duration-200 opacity-0 " +
            (isHovered || !hasImage ? "opacity-100" : "") +
            " " +
            (hasImage ? "text-pure-white" : "")
          }
        />
        <div
          className={
            "absolute w-full h-full pointer-events-none bg-[rgba(0,0,0,0.5)] rounded-full opacity-0 transition-all duration-200 " +
            (isHovered ? "opacity-100" : "")
          }
        />
      </label>

      {errorMessage && (
        <p className="text-red-700 font-medium">{errorMessage}</p>
      )}
    </div>
  );
}
