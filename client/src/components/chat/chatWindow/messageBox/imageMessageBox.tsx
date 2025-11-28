import type { FileMessageType, MessageType } from "@/types/messageTypes";
import { useState } from "react";
import TextMessageBox from "./textMessageBox";

export default function ImageMessageBox({
  message,
  images,
  isSender,
  onImageClick,
  isHybrid = false,
}: {
  message: MessageType;
  images: FileMessageType[];
  isSender: boolean;
  onImageClick: (publicId: string) => void;
  isHybrid?: boolean;
}) {
  return (
    <div
      className={`w-full flex flex-col gap-2 min-h-0 max-sm:min-h-auto ${
        isSender ? "items-end" : "items-start"
      }`}
    >
      {message.content && !isHybrid ? (
        <TextMessageBox message={message} isSender={isSender} />
      ) : null}
      <FormatImages
        images={images}
        isSender={isSender}
        onImageClick={onImageClick}
      />
    </div>
  );
}

function FormatImages({
  images,
  isSender,
  onImageClick,
}: {
  images: FileMessageType[];
  isSender: boolean;
  onImageClick: (publicId: string) => void;
}) {
  const [errorIndexes, setErrorIndexes] = useState<number[]>([]);
  const imageLength = images.length;

  const handleError = (index: number) => {
    setErrorIndexes((prev) => [...prev, index]);
  };

  if (imageLength <= 2 || (imageLength == 3 && errorIndexes.length > 0)) {
    return (
      <div
        className="w-full grid grid-cols-2 grid-rows-1 gap-2 max-h-70 max-w-100"
        style={
          errorIndexes.length > 0 || imageLength === 1
            ? {
                gridTemplateColumns: "1fr",
                justifyItems: isSender ? "end" : "start",
              }
            : {}
        }
      >
        {images.map((image, index) =>
          errorIndexes.includes(index) ? (
            <div
              key={image.publicId}
              className="w-full h-70 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500"
            >
              Image failed to load
            </div>
          ) : (
            <img
              key={image.publicId}
              src={image.url}
              alt="Image"
              className={`rounded-lg object-cover object-center h-full`}
              style={{
                width: imageLength === 1 ? "fit" : "100%",
              }}
              loading="lazy"
              onClick={() => onImageClick(image.publicId)}
              onError={() => handleError(index)}
            />
          )
        )}
      </div>
    );
  }

  if (imageLength == 3) {
    return (
      <div className="w-full grid grid-cols-4 grid-rows-2 gap-2 max-h-70 max-w-100">
        <img
          key={images[0].publicId}
          src={images[0].url}
          alt="Image"
          className={`rounded-lg object-cover object-center w-full h-full col-span-2 row-span-2`}
          loading="lazy"
          onClick={() => onImageClick(images[0].publicId)}
          onError={() => handleError(0)}
        />
        <div className="w-full h-full flex flex-col gap-2 col-span-2 row-span-2">
          <img
            key={images[1].publicId}
            src={images[1].url}
            alt="Image"
            className={`rounded-lg object-cover object-center w-full h-full`}
            loading="lazy"
            onClick={() => onImageClick(images[1].publicId)}
            onError={() => handleError(1)}
          />
          <img
            key={images[2].publicId}
            src={images[2].url}
            alt="Image"
            className={`rounded-lg object-cover object-center w-full h-full`}
            loading="lazy"
            onClick={() => onImageClick(images[2].publicId)}
            onError={() => handleError(2)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-4 grid-rows-2 gap-2 max-h-70 max-w-100">
      <img
        key={images[0].publicId}
        src={images[0].url}
        alt="Image"
        className={`rounded-lg object-cover object-center w-full h-full col-span-3 row-span-2`}
        loading="lazy"
        onClick={() => onImageClick(images[0].publicId)}
        onError={() => handleError(0)}
      />
      <div className="w-full h-full grid grid-cols-1 grid-rows-3 gap-2 col-span-1 row-span-2">
        <img
          key={images[1].publicId}
          src={images[1].url}
          alt="Image"
          className={`rounded-lg object-cover object-center w-full h-full`}
          loading="lazy"
          onClick={() => onImageClick(images[1].publicId)}
          onError={() => handleError(1)}
        />
        <img
          key={images[2].publicId}
          src={images[2].url}
          alt="Image"
          className={`rounded-lg object-cover object-center w-full h-full`}
          loading="lazy"
          onClick={() => onImageClick(images[2].publicId)}
          onError={() => handleError(2)}
        />
        <div className="w-full h-full relative overflow-hidden rounded-lg">
          <img
            key={images[3].publicId}
            src={images[3].url}
            alt="Image"
            className={`object-cover object-center w-full h-full`}
            loading="lazy"
            onClick={() => onImageClick(images[3].publicId)}
            onError={() => handleError(3)}
          />
          {imageLength > 4 && (
            <span
              onClick={() => onImageClick(images[3].publicId)}
              className="absolute cursor-pointer bottom-0 right-0 bg-black/60 text-pure-white text-xl px-1 rounded-bl-lg w-full h-full flex items-center justify-center"
            >
              +{imageLength - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
