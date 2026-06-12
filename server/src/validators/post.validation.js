import { z } from "zod";

export const createPostSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title is too long"),
  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category is too long"),
  htmlContent: z
    .string()
    .min(10, "Content must be at least 10 characters"),
  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters")
    .max(300, "Excerpt is too long"),
  coverImage: z
    .string()
    .url("Cover image must be a valid URL")
    .or(z.literal(""))
    .optional()
    .nullable(),
  seoKeywords: z
    .string()
    .optional()
    .nullable(),
  status: z
    .enum(["DRAFT", "PUBLISHED"])
    .optional(),
});

export const updatePostSchema = createPostSchema.partial();
