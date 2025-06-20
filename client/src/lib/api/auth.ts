import type {
  ForgotPasswordFormSchema,
  LoginSchema,
  ResetPasswordSchema,
  SingUpSchema,
} from "@/lib/zodSchemas/authSchema";
import type { RegisterDataType } from "@/types/authTypes";
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

export async function registerUser(data: RegisterDataType) {
  const formData = new FormData();
  (Object.keys(data) as (keyof RegisterDataType)[]).forEach((key) => {
    if (key === "avatar") {
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

  const { data: response } = await api.post("/auth/register", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response;
}

export async function loginUser(data: LoginSchema) {
  const { data: response } = await api.post("/auth/login", data);
  return response;
}

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
