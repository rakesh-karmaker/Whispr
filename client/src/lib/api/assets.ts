import api from "@/config/axios";
import type { Canceler } from "axios";
import axios from "axios";

export async function getAssets(
  assetType: "file" | "image" | "link",
  pageNumber: number,
  chatId: string,
  _cancel: Canceler
) {
  const { data: response } = await api.get("/assets/get-assets", {
    params: { assetType, pageNumber, chatId },
    cancelToken: new axios.CancelToken((c) => (_cancel = c)),
  });
  return response;
}
