import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const singUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const authProfileSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  avatar: z
    .any()
    .nullable()
    .refine(
      (value) =>
        typeof value === "string"
          ? true
          : value?.length > 0 &&
            value?.[0]?.size <= MAX_FILE_SIZE &&
            ACCEPTED_IMAGE_TYPES.includes(value?.[0]?.type),
      {
        message: `Max image size is ${
          MAX_FILE_SIZE / 1024 / 1024
        }MB and must be a valid image file (JPG, JPEG, PNG or WebP).`,
      }
    ),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const forgotPasswordFormSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
});

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
});

// export types
export type SingUpSchema = z.infer<typeof singUpSchema>;
export type AuthProfileSchema = z.infer<typeof authProfileSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ForgotPasswordFormSchema = z.infer<typeof forgotPasswordFormSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

// export schemas
export {
  singUpSchema,
  authProfileSchema,
  loginSchema,
  forgotPasswordFormSchema,
  resetPasswordSchema,
};
