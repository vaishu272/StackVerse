import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url()
    .default("https://stackverse-api.onrender.com"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// Parse environment variables safely
const processEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NODE_ENV: process.env.NODE_ENV,
};

export const env = envSchema.parse(processEnv);
export type Env = z.infer<typeof envSchema>;
