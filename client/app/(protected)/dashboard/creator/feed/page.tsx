"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { blogService } from "@/features/blog/services/blogService";
import { useBookmarkStore } from "@/features/bookmarks/store/bookmark.store";
import { useShallow } from "zustand/react/shallow";
import { toast } from "react-hot-toast";
import { BlogPost } from "@/features/blog/types/blog";
import RouteGuard from "@/features/auth/components/RouteGuard";
import { optimizeCloudinaryUrl } from "@/shared/utils/imageUtils";
import {
  ArrowLeft,
  Search,
  Calendar,
  PenTool,
  Loader2,
  BookOpen,
} from "lucide-react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import PDFDownloadButton from "@/features/blog/components/PDFDownloadButton";

export default function CreatorFeedPage() {
  const router = useRouter();
  const { bookmarks, addBookmark, removeBookmark } = useBookmarkStore(
    useShallow((state) => ({
      bookmarks: state.bookmarks,
      addBookmark: state.addBookmark,
      removeBookmark: state.removeBookmark,
    })),
  );

  const bookmarkedIds = useMemo(
    () => new Set(bookmarks.map((b) => b.id)),
    [bookmarks]
  );
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const tags = [
    "All",
    "Next.js",
    "Prisma",
    "TypeScript",
    "System Design",
    "Cloud",
    "DevOps",
  ];

  // Fetch published articles with infinite scrolling
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["posts", selectedTag, debouncedSearch],
      queryFn: ({ pageParam = 1 }) =>
        blogService.getPosts(selectedTag, debouncedSearch, pageParam, 6),
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        return lastPage.hasMore ? allPages.length + 1 : undefined;
      },
    });

  const posts = data?.pages.flatMap((page) => page.posts) || [];
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleBookmarkToggle = useCallback(
    (post: BlogPost) => {
      if (bookmarkedIds.has(post.id)) {
        removeBookmark(post.id);
        toast.success("Article removed from bookmarks");
      } else {
        addBookmark(post);
        toast.success("Article saved to bookmarks!");
      }
    },
    [bookmarkedIds, addBookmark, removeBookmark]
  );

  return (
    <RouteGuard allowedRoles={["CREATOR"]}>
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/creator"
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-650 via-violet-650 to-pink-500 dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
                Insights Feed
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Explore architectural guides, blueprints, and system docs
                written by the community.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/editor")}
            className="flex items-center justify-center gap-2 px-4.5 py-3 rounded-xl bg-linear-to-r from-indigo-500 to-pink-500 hover:from-indigo-650 hover:to-pink-650 text-white font-bold text-sm shadow-lg shadow-indigo-500/15 cursor-pointer self-start sm:self-center transition-all hover:scale-[1.02]"
          >
            <PenTool className="w-4 h-4" />
            Write Article
          </button>
        </div>

        {/* Search & Filtering Control Panel */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
          {/* Tag Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                  selectedTag === tag
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                    : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-550 w-4 h-4" />
            <input
              type="text"
              placeholder="Search guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-450 focus:border-indigo-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Feed Listing Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="animate-spin text-indigo-650 w-8 h-8" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
              Loading fresh engineering insights...
            </p>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-8">
            <CreatorPostGrid
              posts={posts}
              bookmarkedIds={bookmarkedIds}
              onBookmarkToggle={handleBookmarkToggle}
            />

            {/* Pagination / Load More scroll trigger */}
            {hasNextPage && (
              <div ref={observerRef} className="flex justify-center py-6">
                {isFetchingNextPage ? (
                  <Loader2 className="animate-spin text-indigo-650 w-6 h-6" />
                ) : (
                  <span className="text-slate-450 dark:text-slate-550 text-xs font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 px-4 py-2 rounded-full cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                    Load more articles
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/60 dark:bg-slate-900/40 border border-slate-250 dark:border-slate-850 rounded-2xl shadow-xs">
            <BookOpen className="mx-auto text-slate-400 dark:text-slate-700 w-12 h-12 mb-4 animate-bounce" />
            <p className="text-slate-650 dark:text-slate-350 text-sm font-bold">
              No matching architectural explainers found.
            </p>
            <p className="text-slate-450 dark:text-slate-550 text-xs mt-1">
              Try adjusting your search keywords or tags category filters.
            </p>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}

const getCategoryGradient = (category: string) => {
  switch (category) {
    case "Prisma":
      return "bg-indigo-500/5 dark:bg-indigo-500/20 border-indigo-200/60 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400";
    case "Next.js":
      return "bg-violet-500/5 dark:bg-violet-500/20 border-violet-200/60 dark:border-violet-500/30 text-violet-600 dark:text-violet-400";
    case "TypeScript":
      return "bg-cyan-500/5 dark:bg-cyan-500/20 border-cyan-200/60 dark:border-cyan-500/30 text-cyan-600 dark:text-cyan-400";
    case "System Design":
      return "bg-emerald-500/5 dark:bg-emerald-500/20 border-emerald-200/60 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400";
    case "DevOps":
      return "bg-orange-500/5 dark:bg-orange-500/20 border-orange-200/60 dark:border-orange-500/30 text-orange-600 dark:text-orange-400";
    case "Cloud":
      return "bg-pink-500/5 dark:bg-pink-500/20 border-pink-200/60 dark:border-pink-500/30 text-pink-600 dark:text-pink-400";
    default:
      return "bg-slate-500/5 dark:bg-slate-500/20 border-slate-200/60 dark:border-slate-500/30 text-slate-600 dark:text-slate-400";
  }
};

interface CreatorPostGridProps {
  posts: BlogPost[];
  bookmarkedIds: Set<string>;
  onBookmarkToggle: (post: BlogPost) => void;
}

const CreatorPostGrid = React.memo(function CreatorPostGrid({
  posts,
  bookmarkedIds,
  onBookmarkToggle,
}: CreatorPostGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => {
        const isSaved = bookmarkedIds.has(post.id);
        return (
          <div
            key={post.id}
            className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 hover:border-slate-350 dark:hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between h-76 shadow-xs transition-all relative overflow-hidden group theme-transition hover:translate-y-[-2px]"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${getCategoryGradient(
                    post.category
                  )}`}
                >
                  {post.category}
                </span>

                <button
                  type="button"
                  onClick={() => onBookmarkToggle(post)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                  title={isSaved ? "Remove Bookmark" : "Save Bookmark"}
                >
                  {isSaved ? (
                    <FaBookmark className="text-indigo-600 dark:text-indigo-400 text-sm" />
                  ) : (
                    <FaRegBookmark className="text-sm" />
                  )}
                </button>
              </div>

              <Link href={`/blog/${post.slug}`} className="block group/link">
                <h3 className="text-lg font-bold leading-snug mb-3 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors line-clamp-2">
                  {post.title}
                </h3>
              </Link>

              <p className="text-slate-500 dark:text-slate-450 text-xs leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 mt-4 flex justify-between items-center text-slate-400">
              <div className="flex items-center gap-2">
                {post.author.avatar ? (
                  <Image
                    src={optimizeCloudinaryUrl(post.author.avatar, 48)}
                    alt={post.author.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white uppercase shadow-sm">
                    {post.author.name.charAt(0)}
                  </div>
                )}
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                  {post.author.name}
                </span>
              </div>

              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-455">
                <span className="text-[10px] flex items-center gap-1.5 font-semibold">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>

                {/* Direct PDF Copy Link */}
                <PDFDownloadButton post={post} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
