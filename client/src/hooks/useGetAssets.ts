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
          const newData: FileMessageType[] = [];
          data.assets.forEach((asset: FileMessageType[]) => {
            newData.push(
              ...asset.map((a) => {
                return { url: a.url, publicId: a.publicId };
              })
            );
          });
          assetType === "image"
            ? setImages((prev) =>
                prev.concat(
                  newData.filter(
                    (img) =>
                      prev.some((i) => i.publicId === img.publicId) === false
                  )
                )
              )
            : setFiles((prev) =>
                prev.concat(
                  newData.filter(
                    (img) =>
                      prev.some((i) => i.publicId === img.publicId) === false
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
