"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService } from "@/features/blog/services/blogService";
import {
  FaFeatherAlt,
  FaEdit,
  FaTrashAlt,
  FaExternalLinkAlt,
  FaSpinner,
  FaFolder,
  FaFileAlt,
  FaCheckCircle,
} from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useShallow } from "zustand/react/shallow";

export default function CreatorDashboard() {
  const { user } = useAuthStore(useShallow((state) => ({ user: state.user })));
  const queryClient = useQueryClient();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Fetch creator's own articles
  const { data, isLoading } = useQuery({
    queryKey: ["my-articles"],
    queryFn: () => blogService.getMyArticles(),
  });

  // Toggle Draft/Published mutation
  const toggleMutation = useMutation({
    mutationFn: (id: string) => blogService.togglePostStatus(id),
    onSuccess: (data) => {
      toast.success(
        data.status === "PUBLISHED"
          ? "Article published!"
          : "Article reverted to draft!",
      );
      queryClient.invalidateQueries({ queryKey: ["my-articles"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogService.deletePost(id),
    onSuccess: () => {
      toast.success("Article deleted successfully");
      setConfirmDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["my-articles"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      toast.error("Failed to delete article");
    },
  });

  const handleToggle = (id: string) => {
    toggleMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 theme-transition">
        <div className="flex flex-col items-center gap-3">
          <FaSpinner className="animate-spin text-indigo-600 text-3xl" />
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            Loading articles inventory...
          </p>
        </div>
      </div>
    );
  }

  const posts = data?.posts || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 text-slate-800 dark:text-slate-100 theme-transition">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Creator Studio, {user?.name || "Creator"}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Manage your engineering drafts, articles inventory, and live
              posts.
            </p>
          </div>

          <Link
            href="/editor"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <FaFeatherAlt className="text-sm" /> Write New Article
          </Link>
        </div>

        {/* Stats Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl flex items-center gap-4 shadow-xs theme-transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg">
              <FaFileAlt />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Articles
              </p>
              <p className="text-2xl font-black mt-0.5">{posts.length}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl flex items-center gap-4 shadow-xs theme-transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg">
              <FaCheckCircle />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Published Posts
              </p>
              <p className="text-2xl font-black mt-0.5">
                {posts.filter((p) => p.status === "PUBLISHED").length}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 p-6 rounded-2xl flex items-center gap-4 shadow-xs theme-transition">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-lg">
              <FaFolder />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Draft Notebooks
              </p>
              <p className="text-2xl font-black mt-0.5">
                {posts.filter((p) => p.status === "DRAFT").length}
              </p>
            </div>
          </div>
        </div>

        {/* Inventory Listing */}
        <div className="bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs theme-transition">
          {posts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100/50 dark:bg-slate-900/60 theme-transition">
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Date Created</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="hover:bg-slate-100/30 dark:hover:bg-slate-900/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100 max-w-xs truncate">
                        {post.title}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-2xs font-bold uppercase px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-500">
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <span
                            className={`text-2xs font-bold uppercase px-2 py-0.5 rounded-full ${
                              post.status === "PUBLISHED"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {post.status}
                          </span>
                          {/* Slide Toggle Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggle(post.id)}
                            disabled={toggleMutation.isPending}
                            className={`relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
                              post.status === "PUBLISHED"
                                ? "bg-indigo-600"
                                : "bg-slate-300 dark:bg-slate-700"
                            }`}
                            title="Toggle Post Status"
                          >
                            <span
                              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                                post.status === "PUBLISHED"
                                  ? "translate-x-4"
                                  : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="View Public Link"
                          >
                            <FaExternalLinkAlt className="w-3.5 h-3.5" />
                          </Link>

                          <Link
                            href={`/editor/edit/${post.id}`}
                            className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                            title="Edit Post"
                          >
                            <FaEdit className="w-3.5 h-3.5" />
                          </Link>

                          {/* Interactive Premium Inline Delete Confirmation */}
                          {confirmDeleteId === post.id ? (
                            <div className="flex items-center gap-1.5 animation-fade-in pl-2">
                              <button
                                onClick={() => handleDelete(post.id)}
                                disabled={deleteMutation.isPending}
                                className="text-xs bg-rose-600 hover:bg-rose-500 text-white font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-2xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold px-1 py-1"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(post.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-450 transition-colors cursor-pointer"
                              title="Delete Post"
                            >
                              <FaTrashAlt className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-20 px-6">
              <FaFolder className="mx-auto text-slate-300 dark:text-slate-800 text-5xl mb-4" />
              <p className="text-slate-500 dark:text-slate-400 text-base font-semibold mb-2">
                No articles found in inventory
              </p>
              <p className="text-slate-400 dark:text-slate-500 text-xs mb-6 max-w-sm mx-auto">
                Begin drafting your first technical engineering guide. Your
                progress will be saved automatically.
              </p>
              <Link
                href="/editor"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                Create First Article
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
