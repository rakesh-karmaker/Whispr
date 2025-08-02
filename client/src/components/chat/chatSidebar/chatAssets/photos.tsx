import ImageViewer from "@/components/ui/imageViewer";
import { useContactAssets } from "@/hooks/useContactAssets";
import useGetAssets from "@/hooks/useGetAssets";
import type React from "react";
import { useCallback, useRef, useState } from "react";

export default function Photos(): React.ReactNode {
  const { images, hasMoreImages, imagePage, setImagePage, setHasMoreImages } =
    useContactAssets();
  const { isLoading } = useGetAssets(
    imagePage,
    hasMoreImages,
    setHasMoreImages,
    "image"
  );
  const [index, setIndex] = useState<number>(0);
  const [open, setOpen] = useState<boolean>(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLImageElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreImages) {
          setImagePage(imagePage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMoreImages]
  );

  return (
    <div className="w-full h-full grid grid-cols-3 gap-1.5 [grid-template-rows:_auto] overflow-hidden">
      {images.map((image, index) => {
        if (image.url === "") return null;
        const key = image.publicId || `${image.url}-${index}`;
        if (index === images.length - 1) {
          return (
            <img
              key={key}
              src={image.url}
              alt="image"
              className="w-full h-full aspect-square object-cover rounded-sm"
              ref={lastElementRef}
              onClick={() => {
                setIndex(index);
                setOpen(true);
              }}
            />
          );
        } else {
          return (
            <img
              key={key}
              src={image.url}
              alt="image"
              className="w-full h-full aspect-square object-cover rounded-sm"
              onClick={() => {
                setIndex(index);
                setOpen(true);
              }}
            />
          );
        }
      })}
      {isLoading &&
        hasMoreImages &&
        [...Array(3)].map((_, index) => (
          <div
            key={index}
            className="w-full h-full aspect-square skeleton rounded-sm"
          />
        ))}

      <ImageViewer
        data={images.map((image) => ({ url: image.url }))}
        open={open}
        setOpen={setOpen}
        index={index}
      />
    </div>
  );
}
