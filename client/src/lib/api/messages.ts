import api from "@/config/axios";
import type { Canceler } from "axios";
import axios from "axios";

export async function getMessages(
  chatId: string,
  pageNumber: number,
  _cancel: Canceler
) {
  const { data: response } = await api.get("/messages/get-messages", {
    params: { chatId, pageNumber },
    cancelToken: new axios.CancelToken((c) => (_cancel = c)),
  });
  return response;
}

export async function uploadFiles(files: File[]) {
  const formdata = new FormData();
  files.forEach((file) => {
    formdata.append("files", file);
  });

  const { data: response } = await api.post(
    "/messages/upload-files",
    formdata,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response;
}
