"use client";

import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  FaArrowLeft,
  FaSpinner,
  FaCalendarAlt,
  FaTag,
  FaClock,
} from "react-icons/fa";
import { BlogPost } from "@/features/blog/types/blog";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useShallow } from "zustand/react/shallow";
import { optimizeCloudinaryUrl } from "@/shared/utils/imageUtils";

const PDFDownloadButton = dynamic(
  () => import("./PDFDownloadButton"),
  {
    ssr: false,
    loading: () => (
      <button className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-sm animate-pulse theme-transition">
        <FaSpinner className="animate-spin text-indigo-500" /> Preparing PDF...
      </button>
    ),
  }
);

interface BlogDetailClientProps {
  post: BlogPost;
}

export default function BlogDetailClient({ post }: BlogDetailClientProps) {
  const user = useAuthStore(useShallow((state) => state.user));
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-24 theme-transition">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        {/* Navigation / Action bar */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <FaArrowLeft /> Back to Feed
          </Link>

          <div className="flex items-center gap-3">
            {/* Conditional Edit Article Button */}
            {user && user.role === "CREATOR" && user.id === post.authorId && (
              <Link
                href={`/editor/edit/${post.id}`}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
              >
                Edit Article
              </Link>
            )}

            {/* PDF Download Trigger */}
            <PDFDownloadButton post={post} variant="button" />
          </div>
        </div>

        {/* Article Header */}
        <header className="mb-10">
          <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full mb-6">
            <FaTag className="text-2xs" /> {post.category}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 dark:border-slate-850 py-4 text-xs md:text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-sm font-black select-none shadow-md">
                {post.author?.name ? post.author.name[0] : "E"}
              </span>
              <div>
                <p className="font-bold text-slate-700 dark:text-slate-200">
                  {post.author?.name || "Elena Rostova"}
                </p>
                <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                  {post.author?.role || "CREATOR"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1.5">
                <FaCalendarAlt /> {formattedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <FaClock />{" "}
                {Math.ceil((post.htmlContent || "").split(" ").length / 200)}{" "}
                min read
              </span>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="w-full aspect-21/9 rounded-2xl overflow-hidden mb-12 border border-slate-200 dark:border-slate-800 shadow-lg">
            <Image
              unoptimized
              src={optimizeCloudinaryUrl(post.coverImage, 1200)}
              alt={post.title}
              width={1200}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Excerpt Summary */}
        {post.excerpt && (
          <div className="bg-slate-100/50 dark:bg-slate-900/30 border-l-4 border-indigo-500 dark:border-indigo-400 p-6 rounded-r-2xl mb-10 text-slate-600 dark:text-slate-400 text-base italic leading-relaxed">
            {post.excerpt}
          </div>
        )}

        {/* Article Body */}
        <article
          className="max-w-none text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed mb-16 ProseMirror"
          dangerouslySetInnerHTML={{ __html: post.htmlContent }}
        />
      </div>
    </div>
  );
}
