import LinkPreviewSkeleton from "@/components/ui/skeletons/linkPreviewSkeleton";
import { useContactAssets } from "@/hooks/useContactAssets";
import useGetAssets from "@/hooks/useGetAssets";
import type { LinkMessageType } from "@/types/messageTypes";
import React, { useCallback, useRef, useState } from "react";
import { FaLink } from "react-icons/fa6";

export default function Links(): React.ReactNode {
  const { links, hasMoreLinks, linkPage, setLinkPage, setHasMoreLinks } =
    useContactAssets();
  const { isLoading } = useGetAssets(
    linkPage,
    hasMoreLinks,
    setHasMoreLinks,
    "link"
  );

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMoreLinks) {
          setLinkPage(linkPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMoreLinks]
  );

  const length = links ? links.length : 0;

  return (
    <div className="w-full h-full grid grid-cols-1 gap-2.5 overflow-hidden">
      {links.map((link, index) => {
        return (
          <Link
            key={`${link.messageId}`}
            linkData={link}
            lastElementRef={index === length - 1 ? lastElementRef : null}
          />
        );
      })}
      {isLoading &&
        hasMoreLinks &&
        [...Array(2)].map((_, index) => <LinkPreviewSkeleton key={index} />)}
    </div>
  );
}

function Link({
  linkData,
  lastElementRef,
}: {
  linkData: LinkMessageType;
  lastElementRef: ((node: HTMLDivElement) => void) | null;
}) {
  const title = linkData.title || linkData.url;
  if (!linkData.url) return null;
  const [isImageUrlValid, setIsImageUrlValid] = useState<boolean>(false);
  if (linkData.imageURL) {
    const img = new Image();
    img.src = linkData.imageURL;
    img.onload = () => setIsImageUrlValid(true);
    img.onerror = () => setIsImageUrlValid(false);
  }

  return (
    <div ref={lastElementRef}>
      <a
        href={linkData.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm w-full relative h-fit flex gap-2.5 rounded-md items-center bg-pure-white dark:bg-d-dark-gray hover:bg-white-2 dark:hover:bg-d-light-dark-gray transition-all duration-200"
      >
        {linkData.imageURL && isImageUrlValid ? (
          <img
            src={linkData.imageURL}
            alt={title}
            className="w-15 aspect-square object-cover rounded-md"
          />
        ) : (
          <div className="min-w-15 aspect-square rounded-md bg-gray-200 dark:bg-d-light-dark-gray flex items-center justify-center">
            <FaLink className="text-gray-500 text-2xl" />
          </div>
        )}
        <span className="w-full flex flex-col">
          <span className="dark:text-d-white/90 line-clamp-1">{title}</span>
          {linkData.title && (
            <span className="text-gray-500 text-xs dark:text-d-white/50 line-clamp-2">
              {linkData.url}
            </span>
          )}
        </span>
      </a>
    </div>
  );
}
