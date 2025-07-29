import React, { useRef } from "react";
import Lightbox, {
  type ThumbnailsRef,
  type ZoomRef,
} from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export default function ImageViewer({
  data,
  open,
  setOpen,
  index,
}: {
  data: { url: string }[];
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  index: number;
}) {
  const thumbnailsRef = useRef<ThumbnailsRef>(null);
  const zoomRef = useRef<ZoomRef>(null);
  return (
    <Lightbox
      open={open}
      index={index}
      close={() => setOpen(false)}
      slides={data.map((image) => {
        return { src: image.url };
      })}
      animation={{ swipe: 0 }}
      plugins={[Thumbnails, Zoom]}
      carousel={{ finite: true, preload: 100 }}
      thumbnails={{
        ref: thumbnailsRef,
        width: 56,
        height: 56,
        gap: 5,
        vignette: false,
        padding: 3,
      }}
      on={{
        click: () => {
          (thumbnailsRef.current?.visible
            ? thumbnailsRef.current?.hide
            : thumbnailsRef.current?.show)?.();
        },
      }}
      zoom={{ ref: zoomRef }}
    />
  );
}
