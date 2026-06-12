import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DraftState {
  title: string;
  category: string;
  coverImage: string;
  excerpt: string;
  seoKeywords: string;
  htmlContent: string;
  setDraftField: (field: string, value: string) => void;
  clearDraft: () => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      title: "",
      category: "Next.js",
      coverImage: "",
      excerpt: "",
      seoKeywords: "",
      htmlContent: "",
      setDraftField: (field, value) =>
        set((state) => ({ ...state, [field]: value })),
      clearDraft: () =>
        set({
          title: "",
          category: "Next.js",
          coverImage: "",
          excerpt: "",
          seoKeywords: "",
          htmlContent: "",
        }),
    }),
    {
      name: "stackverse-draft-store", // Unique name for localStorage key
    }
  )
);
