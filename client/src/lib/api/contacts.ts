import api from "@/config/axios";
import axios from "axios";
import type { Canceler } from "axios";

export async function searchContacts(
  searchTerm: string,
  pageNumber: number,
  cancel: Canceler
) {
  const { data: response } = await api.get("/contact/search-contacts", {
    params: { searchTerm, pageNumber },
    cancelToken: new axios.CancelToken((c) => (cancel = c)),
  });
  return response;
}
