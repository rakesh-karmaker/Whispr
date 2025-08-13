import { getAssets } from "@/lib/api/contacts";
import type { Canceler } from "axios";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelectedContact } from "./useSelectContact";
import { useContactAssets } from "./useContactAssets";
import type { FileMessageType, LinkMessageType } from "@/types/messageTypes";

export default function useGetAssets(
  pageNumber: number,
  hasMore: boolean,
  setHasMore: (hasMore: boolean) => void,
  assetType: "image" | "file" | "link"
): {
  isLoading: boolean;
} {
  const { setImages, setFiles, setLinks } = useContactAssets();
  const { selectedContact } = useSelectedContact();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    let cancel: Canceler = () => {};

    const fetchData = async () => {
      try {
        const data = await getAssets(
          assetType,
          pageNumber,
          selectedContact._id,
          cancel
        );

        if (assetType !== "link") {
          // Only add assets that are not already present (by publicId)
          const updateAssets = (prev: FileMessageType[]) => {
            const existingIds = new Set(prev.map((a) => a.publicId));
            return prev.concat(
              data.assets.filter(
                (asset: FileMessageType) => !existingIds.has(asset.publicId)
              )
            );
          };

          assetType === "image"
            ? setImages(updateAssets)
            : setFiles(updateAssets);
        } else {
          setLinks((prev) => {
            const existingIds = new Set(prev.map((a) => a.messageId));
            return prev.concat(
              data.assets.filter(
                (asset: LinkMessageType) => !existingIds.has(asset.messageId)
              )
            );
          });
        }

        setHasMore(data.hasMore);
      } catch (err) {
        if (axios.isCancel(err)) return;
        console.log(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (hasMore) fetchData();
    return () => {
      cancel();
    };
  }, [pageNumber]);

  return { isLoading };
}
