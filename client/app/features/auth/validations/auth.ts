import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
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
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long")
    .regex(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).*$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  role: z.enum(["VISITOR", "CREATOR"], {
    message: "Role is required",
  }),
});

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address")
    .transform((val) => val.trim().toLowerCase()),

  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
