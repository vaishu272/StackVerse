"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useInfiniteQuery } from "@tanstack/react-query";
import { blogService } from "@/features/blog/services/blogService";
import { useBookmarkStore } from "@/features/bookmarks/store/bookmark.store";
import {
  FaSearch,
  FaBookmark,
  FaRegBookmark,
  FaBookOpen,
  FaRegCalendarAlt,
  FaSpinner,
  FaHistory,
  FaStar,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { BlogPost } from "@/features/blog/types/blog";
import PDFDownloadButton from "@/features/blog/components/PDFDownloadButton";

import { optimizeCloudinaryUrl } from "@/shared/utils/imageUtils";
import { useShallow } from "zustand/react/shallow";

export default function VisitorDashboard() {
  const { bookmarks, addBookmark, removeBookmark } = useBookmarkStore(
    useShallow((state) => ({
      bookmarks: state.bookmarks,
      addBookmark: state.addBookmark,
      removeBookmark: state.removeBookmark,
    })),
  );

  const bookmarkedIds = useMemo(
    () => new Set(bookmarks.map((b) => b.id)),
    [bookmarks],
  );
  const [activeTab, setActiveTab] = useState<"explore" | "bookmarks">(
    "explore",
  );
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [readHistoryCount, setReadHistoryCount] = useState(0);

  // Load reading history from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const history = localStorage.getItem("stackverse_read_history");
      if (history) {
        try {
          const parsed = JSON.parse(history);
          if (Array.isArray(parsed)) {
            setTimeout(() => {
              setReadHistoryCount(parsed.length);
            }, 0);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

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

  // Determine Favorite Topic category based on Bookmarks
  const getFavoriteTopic = () => {
    const publishedBookmarks = bookmarks.filter(
      (b: BlogPost) => b.status === "PUBLISHED",
    );
    if (publishedBookmarks.length === 0) return "None";
    const counts: Record<string, number> = {};
    publishedBookmarks.forEach((b: { category: string | number }) => {
      counts[b.category] = (counts[b.category] || 0) + 1;
    });
    let fav = "None";
    let max = 0;
    Object.entries(counts).forEach(([cat, val]) => {
      if (val > max) {
        max = val;
        fav = cat;
      }
    });
    return fav;
  };

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
    [bookmarkedIds, addBookmark, removeBookmark],
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 text-slate-800 dark:text-slate-100 theme-transition">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Visitor Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Explore compiled write-ups, download blueprints, and manage your
            reading library.
          </p>
        </div>

        {/* stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl flex items-center gap-4 shadow-xs theme-transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
              <FaBookmark />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Bookmarked
              </p>
              <p className="text-2xl font-black mt-0.5">{bookmarks.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl flex items-center gap-4 shadow-xs theme-transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
              <FaHistory />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Articles Read
              </p>
              <p className="text-2xl font-black mt-0.5">{readHistoryCount}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl flex items-center gap-4 shadow-xs theme-transition">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
              <FaStar />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Favorite Topic
              </p>
              <p className="text-xl font-black mt-0.5 truncate max-w-[180px]">
                {getFavoriteTopic()}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-6">
          <button
            onClick={() => setActiveTab("explore")}
            className={`pb-4 text-sm font-semibold tracking-wide transition-all cursor-pointer relative ${
              activeTab === "explore"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            Explore Articles
            {activeTab === "explore" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("bookmarks")}
            className={`pb-4 text-sm font-semibold tracking-wide transition-all cursor-pointer relative flex items-center gap-2 ${
              activeTab === "bookmarks"
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            My Bookmarks
            <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 text-[10px] font-bold rounded-full border border-indigo-500/20">
              {bookmarks.length}
            </span>
            {activeTab === "bookmarks" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === "explore" ? (
          <div>
            {/* Search & Tags */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 mb-8">
              {/* Tag Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                      selectedTag === tag
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/10"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:max-w-xs">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search architecture..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Articles List */}
            {isLoading ? (
              <div className="flex justify-center py-20">
                <FaSpinner className="animate-spin text-indigo-650 text-3xl" />
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                <PostGrid
                  posts={posts}
                  bookmarkedIds={bookmarkedIds}
                  onBookmarkToggle={handleBookmarkToggle}
                />

                {/* Infinite Scroll trigger element */}
                {hasNextPage && (
                  <div ref={observerRef} className="flex justify-center py-6">
                    {isFetchingNextPage ? (
                      <FaSpinner className="animate-spin text-indigo-600 text-2xl" />
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-xs font-semibold">
                        Load more write-ups
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <p className="text-slate-400 dark:text-slate-500 text-sm">
                  No articles match your search criteria.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Bookmarks View */
          <div>
            {bookmarks.filter((b: BlogPost) => b.status === "PUBLISHED")
              .length > 0 ? (
              <BookmarkedGrid
                bookmarks={bookmarks}
                bookmarkedIds={bookmarkedIds}
                onBookmarkToggle={handleBookmarkToggle}
              />
            ) : (
              <div className="text-center py-20 bg-white dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <FaBookOpen className="mx-auto text-slate-300 dark:text-slate-800 text-5xl mb-4" />
                <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mb-2">
                  No bookmarks saved yet
                </p>
                <p className="text-slate-400 dark:text-slate-500 text-xs max-w-xs mx-auto">
                  Explore the dashboard feed and click the bookmark button on
                  articles to save them here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
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

interface PostGridProps {
  posts: BlogPost[];
  bookmarkedIds: Set<string>;
  onBookmarkToggle: (post: BlogPost) => void;
}

const PostGrid = React.memo(function PostGrid({
  posts,
  bookmarkedIds,
  onBookmarkToggle,
}: PostGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => {
        const isSaved = bookmarkedIds.has(post.id);
        return (
          <div
            key={post.id}
            className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/85 hover:border-slate-350 dark:hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between h-72 shadow-xs transition-all relative overflow-hidden group theme-transition"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${getCategoryGradient(
                    post.category,
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

              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 flex justify-between items-center text-slate-400 dark:text-slate-550">
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
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  {post.author.name}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] flex items-center gap-1.5">
                  <FaRegCalendarAlt />{" "}
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>

                {/* PDF Download Direct Link */}
                <PDFDownloadButton post={post} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

interface BookmarkedGridProps {
  bookmarks: BlogPost[];
  bookmarkedIds: Set<string>;
  onBookmarkToggle: (post: BlogPost) => void;
}

const BookmarkedGrid = React.memo(function BookmarkedGrid({
  bookmarks,

  onBookmarkToggle,
}: BookmarkedGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookmarks
        .filter((b: BlogPost) => b.status === "PUBLISHED")
        .map((post: BlogPost) => {
          return (
            <div
              key={post.id}
              className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/85 hover:border-slate-350 dark:hover:border-slate-750 rounded-2xl p-6 flex flex-col justify-between h-72 shadow-xs transition-all relative overflow-hidden group theme-transition"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full border ${getCategoryGradient(
                      post.category,
                    )}`}
                  >
                    {post.category}
                  </span>

                  <button
                    type="button"
                    onClick={() => onBookmarkToggle(post)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer"
                    title="Remove Bookmark"
                  >
                    <FaBookmark className="text-indigo-650 dark:text-indigo-400 text-sm" />
                  </button>
                </div>

                <Link href={`/blog/${post.slug}`} className="block group/link">
                  <h3 className="text-lg font-bold leading-snug mb-3 group-hover/link:text-indigo-600 dark:group-hover/link:text-indigo-400 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </Link>

                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-4 flex justify-between items-center text-slate-400 dark:text-slate-550">
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
                  <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                    {post.author.name}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] flex items-center gap-1.5">
                    <FaRegCalendarAlt />{" "}
                    {new Date(post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>

                  {/* PDF Download Direct Link */}
                  <PDFDownloadButton post={post} />
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
});
