import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BlogPost } from "@/features/blog/types/blog";

interface BookmarkState {
  bookmarks: BlogPost[];
  addBookmark: (post: BlogPost) => void;
  removeBookmark: (postId: string) => void;
  isBookmarked: (postId: string) => boolean;
}

export const useBookmarkStore = create<BookmarkState>()(
  persist(
    (set, get) => ({
      bookmarks: [],
      addBookmark: (post) =>
        set((state) => ({
          bookmarks: [...state.bookmarks, post],
        })),
      removeBookmark: (postId) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== postId),
        })),
      isBookmarked: (postId) =>
        get().bookmarks.some((b) => b.id === postId),
    }),
    {
      name: "stackverse_bookmark_store",
    }
  )
);
