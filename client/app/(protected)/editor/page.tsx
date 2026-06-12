"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDraftStore } from "@/features/editor/store/draft.store";
import { blogService } from "@/features/blog/services/blogService";
import { toast } from "react-hot-toast";
import { Form } from "@/shared/components/ui/form";
import { ArrowLeft, RefreshCw, CheckCircle } from "lucide-react";
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
  htmlContent: z
    .string()
    .refine(
      (val) => {
        const plainText = val.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
        return plainText.length >= 10;
      },
      { message: "Article content must be at least 10 characters long (excluding HTML tags)" }
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
  seoKeywords: z
    .string()
    .optional()
    .nullable(),
});

type PostFormValues = z.infer<typeof postSchema>;

export default function NewArticlePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "saving">("idle");
  const [editorKey, setEditorKey] = useState(0);

  // Get initial values once from Zustand store without subscription
  const initialDraft = useDraftStore.getState();

  // Initialize form using default values from Zustand draft store
  const form = useForm<PostFormValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: initialDraft.title || "",
      category: initialDraft.category || "Next.js",
      coverImage: initialDraft.coverImage || "",
      excerpt: initialDraft.excerpt || "",
      seoKeywords: initialDraft.seoKeywords || "",
      htmlContent: initialDraft.htmlContent || "",
    },
    mode: "onChange",
  });

  const clearDraft = useDraftStore((state) => state.clearDraft);

  // Sync form changes back to Zustand draft store for autosave persistence without re-renders
  useEffect(() => {
    let saveTimeout: NodeJS.Timeout;
    let savedTimeout: NodeJS.Timeout;

    // eslint-disable-next-line react-hooks/incompatible-library
    const subscription = form.watch((values) => {
      const hasValues =
        values.title ||
        values.excerpt ||
        values.coverImage ||
        values.seoKeywords ||
        values.htmlContent;

      if (hasValues) {
        setSaveStatus("saving");

        if (saveTimeout) clearTimeout(saveTimeout);
        if (savedTimeout) clearTimeout(savedTimeout);

        saveTimeout = setTimeout(() => {
          // Sync all fields to Zustand store at once
          useDraftStore.setState({
            title: values.title || "",
            category: values.category || "Next.js",
            coverImage: values.coverImage || "",
            excerpt: values.excerpt || "",
            seoKeywords: values.seoKeywords || "",
            htmlContent: values.htmlContent || "",
          });

          savedTimeout = setTimeout(() => {
            setSaveStatus("saved");
          }, 400);
        }, 1000); // 1-second debounce to avoid excessive localStorage operations on typing
      }
    });

    return () => {
      subscription.unsubscribe();
      if (saveTimeout) clearTimeout(saveTimeout);
      if (savedTimeout) clearTimeout(savedTimeout);
    };
  }, [form]);

  const onSubmit = async (values: PostFormValues, status: "DRAFT" | "PUBLISHED") => {
    setSubmitting(true);
    try {
      await blogService.createPost({
        title: values.title,
        category: values.category,
        coverImage: values.coverImage || undefined,
        excerpt: values.excerpt,
        seoKeywords: values.seoKeywords || undefined,
        htmlContent: values.htmlContent,
        status,
      });

      toast.success(
        status === "PUBLISHED"
          ? "Article published successfully!"
          : "Draft saved successfully!"
      );

      // Clear Zustand draft store upon successful creation
      clearDraft();

      router.push("/dashboard/creator");
    } catch (error: unknown) {
      console.error(error);
      const errorWithResponse = error as { response?: { data?: { message?: string } } };
      const serverMsg =
        errorWithResponse?.response?.data?.message || "Failed to save article. Please try again.";
      toast.error(serverMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSave = (status: "DRAFT" | "PUBLISHED") => {
    form.handleSubmit((values) => onSubmit(values, status))();
  };

  const handleDiscardDraft = () => {
    if (window.confirm("Are you sure you want to discard the current draft and start over?")) {
      clearDraft();
      form.reset({
        title: "",
        category: "Next.js",
        coverImage: "",
        excerpt: "",
        seoKeywords: "",
        htmlContent: "",
      });
      setEditorKey((prev) => prev + 1);
      toast.success("Draft cleared.");
    }
  };

  return (
    <RouteGuard allowedRoles={["CREATOR"]}>
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
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
                  Write New Article
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-550">
                  Create an engineering guide or architectural walkthrough
                </p>
              </div>
            </div>

            {/* Draft Auto-save Indicators */}
            <div className="flex items-center gap-2">
              {saveStatus === "saving" && (
                <span className="flex items-center gap-1.5 text-2xs text-slate-400 font-semibold">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Saving draft...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="flex items-center gap-1.5 text-2xs text-indigo-500 dark:text-indigo-400 font-bold bg-indigo-500/5 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/10">
                  <CheckCircle className="w-3 h-3" /> Auto-saved locally
                </span>
              )}
            </div>
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
            <EditorField key={editorKey} />

            {/* Actions panel */}
            <PublishActions
              submitting={submitting}
              isEdit={false}
              onSave={handleSave}
              onDiscard={handleDiscardDraft}
            />
          </div>
        </form>
      </Form>
    </RouteGuard>
  );
}
