import { getAssets } from "@/lib/api/contacts";
import type { Canceler } from "axios";
import axios from "axios";
import { useEffect, useState } from "react";
import { useSelectedContact } from "./useSelectContact";
import { useContactAssets } from "./useContactAssets";
import type { FileMessageType } from "@/types/messageTypes";

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
          const assets: FileMessageType[] = [];
          data.assets.forEach((asset: FileMessageType[]) => {
            asset.forEach((item: FileMessageType) => {
              if (item) {
                assets.push(item);
              }
            });
          });

          const isImage = assetType === "image";
          const prefix = isImage ? "whispr/images/" : "whispr/files/";

          // Filter assets by type and remove duplicates based on publicId
          const filteredAssets = assets.filter((asset) =>
            asset.publicId.startsWith(prefix)
          );

          // Only add assets that are not already present (by publicId)
          const updateAssets = (prev: FileMessageType[]) => {
            const existingIds = new Set(prev.map((a) => a.publicId));
            return prev.concat(
              filteredAssets.filter((asset) => !existingIds.has(asset.publicId))
            );
          };

          isImage ? setImages(updateAssets) : setFiles(updateAssets);
        } else {
          setLinks((prev) => prev.concat(data.assets));
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
