import ImageViewer from "@/components/ui/imageViewer";
import { useContactAssets } from "@/hooks/useContactAssets";
import useGetAssets from "@/hooks/useGetAssets";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

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
    (node: HTMLSpanElement) => {
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
  const updatePage = () => {
    if (hasMoreImages) {
      setImagePage(imagePage + 1);
    }
  };

  return (
    <div className="w-full h-full grid grid-cols-3 gap-1.5 [grid-template-rows:_auto] overflow-hidden">
      {images.map((image, index) => {
        if (image.url === "") return null;
        const key = `${image.publicId}-${index}` || `${image.url}-${index}`;

        return (
          <Photo
            key={key}
            image={image}
            lastElementRef={index === images.length - 1 ? lastElementRef : null}
            index={index}
            setIndex={setIndex}
            setOpen={setOpen}
            updatePage={updatePage}
          />
        );
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

function Photo({
  image,
  lastElementRef,
  index,
  setIndex,
  setOpen,
  updatePage,
}: {
  image: { url: string; publicId: string };
  lastElementRef: ((node: HTMLSpanElement) => void) | null;
  index: number;
  setIndex: (index: number) => void;
  setOpen: (open: boolean) => void;
  updatePage: () => void;
}): React.ReactNode {
  if (image.url === "") return null;
  const [hide, setHide] = useState<boolean>(false);
  return (
    <span ref={lastElementRef} className={`${hide ? "hidden" : ""}`}>
      <LazyLoadImage
        src={image.url}
        alt="image"
        className="w-full h-full aspect-square object-cover rounded-sm cursor-pointer hover:opacity-80 transition-all duration-200"
        onClick={() => {
          setIndex(index);
          setOpen(true);
        }}
        placeholder={
          <div className="w-full h-full aspect-square bg-gray-200 skeleton rounded-sm" />
        }
        onError={(e) => {
          // Hide the image and show fallback div
          setHide(true);
          lastElementRef !== null && updatePage();
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    </span>
  );
}
