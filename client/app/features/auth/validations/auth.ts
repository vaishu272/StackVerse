import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name is too long")
    .transform((val) => val.trim()),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .transform((val) => val.trim().toLowerCase()),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),

  role: z.enum(["VISITOR", "CREATOR"]),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .transform((val) => val.trim().toLowerCase()),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
