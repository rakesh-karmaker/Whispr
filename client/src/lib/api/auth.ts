import type { SingUpSchema } from "@/lib/zodSchemas/authSchema";
import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}`,
  headers: { "Content-Type": "application/json" },
});

export async function addTempUser(data: SingUpSchema) {
  const { data: response } = await api.post("/auth/add-temp-user", data);
  return response;
}

export async function getTempUser(id: string) {
  const { data: response } = await api.get(`/auth/get-temp-user/${id}`);
  return response;
}
