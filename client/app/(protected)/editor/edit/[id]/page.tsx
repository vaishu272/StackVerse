"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { blogService } from "@/features/blog/services/blogService";
import { toast } from "react-hot-toast";
import { Form } from "@/shared/components/ui/form";
import { ArrowLeft, Loader2, FolderOpen } from "lucide-react";
import RouteGuard from "@/features/auth/components/RouteGuard";

import ArticleTitleField from "@/features/editor/components/ArticleTitleField";
import CategoryField from "@/features/editor/components/CategoryField";
import CoverImageUpload from "@/features/editor/components/CoverImageUpload";
import ExcerptField from "@/features/editor/components/ExcerptField";
import SeoKeywordsField from "@/features/editor/components/SeoKeywordsField";
import EditorField from "@/features/editor/components/EditorField";
import PublishActions from "@/features/editor/components/PublishActions";

// Zod form validation schema
const postSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title is too long (max 150 characters)"),
  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category is too long (max 50 characters)"),
  htmlContent: z.string().refine(
    (val) => {
      const plainText = val
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();
      return plainText.length >= 10;
    },
    {
      message:
        "Article content must be at least 10 characters long (excluding HTML tags)",
    },
  ),
  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters")
    .max(300, "Excerpt is too long (max 300 characters)"),
  coverImage: z
    .string()
    .url("Cover image must be a valid URL")
    .or(z.literal(""))
    .optional()
    .nullable(),
  seoKeywords: z.string().optional().nullable(),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Fetch the article details from creator's inventory
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-articles"],
    queryFn: () => blogService.getMyArticles(),
  });

  const posts = data?.posts || [];
  const post = posts.find((p) => p.id === id);

  // Initialize form controls
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      category: "Next.js",
      coverImage: "",
      excerpt: "",
      seoKeywords: "",
      htmlContent: "",
    },
    mode: "onChange",
  });

  // Populate form fields once article data is loaded
  useEffect(() => {
    if (post && !isLoaded) {
      form.reset({
        title: post.title || "",
        category: post.category || "Next.js",
        coverImage: post.coverImage || "",
        excerpt: post.excerpt || "",
        seoKeywords: post.seoKeywords || "",
        htmlContent: post.htmlContent || "",
      });
      setTimeout(() => {
        setIsLoaded(true);
      }, 0);
    }
  }, [post, form, isLoaded]);

  const onSubmit = async (
    values: PostFormValues,
    status: "DRAFT" | "PUBLISHED",
  ) => {
    setSubmitting(true);
    try {
      await blogService.updatePost(id, {
        title: values.title,
        category: values.category,
        coverImage: values.coverImage || "",
        excerpt: values.excerpt,
        seoKeywords: values.seoKeywords || "",
        htmlContent: values.htmlContent,
        status,
      });

      toast.success(
        status === "PUBLISHED"
          ? "Article published successfully!"
          : "Article updated as draft!",
      );

      // Invalidate queries to refresh dashboard articles lists
      queryClient.invalidateQueries({ queryKey: ["my-articles"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      router.push("/dashboard/creator");
    } catch (err: unknown) {
      console.error(err);
      const errorWithResponse = err as {
        response?: { data?: { message?: string } };
      };
      const serverMsg =
        errorWithResponse?.response?.data?.message ||
        "Failed to update article. Please try again.";
      toast.error(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = (status: "DRAFT" | "PUBLISHED") => {
    form.handleSubmit((values) => onSubmit(values, status))();
  };

  if (isLoading || !isLoaded) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 animate-fade-in">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-650" />
        <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
          Loading article data...
        </p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center animate-fade-in">
        <FolderOpen className="w-14 h-14 text-slate-400 dark:text-slate-800 animate-pulse" />
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-200">
            Article Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1 max-w-xs">
            We couldn&apos;t locate the requested article in your inventory.
          </p>
        </div>
        <Link
          href="/dashboard/creator"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Studio
        </Link>
      </div>
    );
  }

  return (
    <RouteGuard allowedRoles={["CREATOR"]}>
      <Form {...form}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in"
        >
          {/* Top action bar */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/creator"
                className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                  Edit Article
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-550">
                  Modify and refine your existing engineering document
                </p>
              </div>
            </div>

            {/* Current status display */}
            <span
              className={`text-2xs font-bold uppercase px-3 py-1 rounded-full border ${
                post.status === "PUBLISHED"
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
              }`}
            >
              Status: {post.status}
            </span>
          </div>

          {/* Form fields card wrapper */}
          <div className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
            {/* Article Title */}
            <ArticleTitleField />

            {/* Category & Cover Image Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-5">
                <CategoryField />
              </div>
              <div className="md:col-span-7">
                <CoverImageUpload />
              </div>
            </div>

            {/* Excerpt Summary */}
            <ExcerptField />

            {/* SEO Keywords */}
            <SeoKeywordsField />

            {/* Content Editor */}
            <EditorField key={post.id} />

            {/* Actions panel */}
            <PublishActions
              submitting={submitting}
              isEdit={true}
              onSave={handleUpdate}
            />
          </div>
        </form>
      </Form>
    </RouteGuard>
  );
}
