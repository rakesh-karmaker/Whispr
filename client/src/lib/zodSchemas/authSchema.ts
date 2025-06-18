import { z } from "zod";

const singUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// export types
export type SingUpSchema = z.infer<typeof singUpSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;

// export schemas
export { singUpSchema, loginSchema };
