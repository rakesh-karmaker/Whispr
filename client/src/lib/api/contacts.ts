import type { Option } from "@/components/ui/multiSelectDropdown";
import api from "@/config/axios";
import type {
  CreateNewGroupMutationProps,
  UpdateGroupMutationProps,
} from "@/types/contactTypes";
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

export async function getAllContacts(pageNumber: number, cancel: Canceler) {
  const { data: response } = await api.get("/contact/get-all-contacts", {
    params: { pageNumber },
    cancelToken: new axios.CancelToken((c) => (cancel = c)),
  });
  return response;
}

export async function getContact(chatId: string) {
  const { data: response } = await api.get("/contact/get-contact", {
    params: { chatId },
  });
  return response;
}

export async function createNewContact(data: Option) {
  const { data: response } = await api.post(
    "/contact/create-new-contact",
    data
  );
  return response;
}

export async function createNewGroup(data: CreateNewGroupMutationProps) {
  const formData = new FormData();
  (Object.keys(data) as (keyof CreateNewGroupMutationProps)[]).forEach(
    (key) => {
      if (key === "groupImage") {
        if (data[key] instanceof FileList && data[key]?.[0] !== undefined) {
          formData.append("groupImage", data[key][0]);
          return;
        }
      }

      if (key === "selectedUsers") {
        formData.append("selectedUsers", JSON.stringify(data[key]));
        return;
      }

      formData.append(key, data[key] as string | Blob);
    }
  );

  const { data: response } = await api.post(
    "/contact/create-new-group",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response;
}

export async function updateGroup(data: UpdateGroupMutationProps) {
  const formData = new FormData();
  (Object.keys(data) as (keyof UpdateGroupMutationProps)[]).forEach((key) => {
    if (key === "groupImage") {
      if (typeof data[key] === "string") {
        formData.append("avatar", data[key] as string);
      } else if (
        data[key] instanceof FileList &&
        data[key]?.[0] !== undefined
      ) {
        formData.append("avatar", data[key][0]);
      }
      return;
    }

    formData.append(key, data[key] as string | Blob);
  });

  const { data: response } = await api.patch(
    "/contact/update-group",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response;
}
