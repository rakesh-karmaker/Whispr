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

          console.log(data.assets, "assets");

          assetType === "image"
            ? setImages((prev) =>
                prev.concat(
                  assets
                    .map((asset: FileMessageType) => {
                      if (asset.publicId.startsWith("whispr/images/")) {
                        return asset;
                      }
                      return undefined;
                    })
                    .filter(
                      (asset): asset is FileMessageType => asset !== undefined
                    )
                )
              )
            : setFiles((prev) =>
                prev.concat(
                  assets
                    .map((asset: FileMessageType) => {
                      if (asset.publicId.startsWith("whispr/files/")) {
                        return asset;
                      }
                      return undefined;
                    })
                    .filter(
                      (asset): asset is FileMessageType => asset !== undefined
                    )
                )
              );
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
