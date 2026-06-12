"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { blogService } from "@/features/blog/services/blogService";
import BlogDetailClient from "@/features/blog/components/BlogDetailClient";
import { Loader2, FolderOpen, ArrowLeft } from "lucide-react";

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Fetch single post details by slug using React Query
  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => blogService.getPostBySlug(slug),
    enabled: !!slug,
    retry: 1, // Minimize retries on 404 to fail fast
  });

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-slate-500 dark:text-slate-400 font-semibold text-sm">
          Loading article content...
        </p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center animate-fade-in">
        <FolderOpen className="w-14 h-14 text-slate-300 dark:text-slate-800 animate-pulse" />
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-200">
            Article Not Found
          </h2>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1 max-w-sm">
            The article you are trying to access might have been deleted, set to
            draft, or does not exist.
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Go Back
        </button>
      </div>
    );
  }

  return <BlogDetailClient post={post} />;
}
