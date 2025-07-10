import { SERVER } from "@/config/constants";
import axios from "axios";

const api = axios.create({
  baseURL: `${SERVER}`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export default api;
