import api from "@/config/axios";
import type {
  ForgotPasswordFormSchema,
  ResetPasswordSchema,
} from "@/lib/zodSchemas/authSchema";

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
