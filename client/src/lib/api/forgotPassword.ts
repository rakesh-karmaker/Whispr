import type {
  ForgotPasswordFormSchema,
  ResetPasswordSchema,
} from "@/lib/zodSchemas/authSchema";
import { SERVER } from "@/utils/constants";
import axios from "axios";

const api = axios.create({
  baseURL: `${SERVER}`,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

export async function sendForgotPasswordEmail(data: ForgotPasswordFormSchema) {
  const { data: response } = await api.post("/auth/forgot-password", data);
  return response;
}

export async function verifyOtp(email: string, otp: string) {
  const { data: response } = await api.post("/auth/verify-otp", { email, otp });
  return response;
}

export async function resetPassword(
  data: ResetPasswordSchema & { email: string; token: string }
) {
  const { data: response } = await api.post("/auth/reset-password", data);
  return response;
}
