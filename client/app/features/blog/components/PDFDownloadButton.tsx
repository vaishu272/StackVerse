"use client";

import React, { useState } from "react";
import { FaFilePdf, FaSpinner, FaDownload } from "react-icons/fa";
import { BlogPost } from "@/features/blog/types/blog";
import { toast } from "react-hot-toast";

interface PDFDownloadButtonProps {
  post: BlogPost;
  variant?: "button" | "icon";
}

export default function PDFDownloadButton({ post, variant = "icon" }: PDFDownloadButtonProps) {
  const [isPreparing, setIsPreparing] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPreparing) return;

    setIsPreparing(true);
    const toastId = toast.loading("Generating PDF document...");

    try {
      // Programmatically import heavy libraries only on user interaction
      const { pdf } = await import("@react-pdf/renderer");
      const BlogPDFDocument = (await import("./BlogPDFDocument")).default;

      // Render document to blob
      const doc = <BlogPDFDocument post={post} />;
      const blob = await pdf(doc).toBlob();

      // Trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${post.slug || "article"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF copy.", { id: toastId });
    } finally {
      setIsPreparing(false);
    }
  };

  if (variant === "button") {
    return (
      <button
        onClick={handleDownload}
        disabled={isPreparing}
        className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-sm cursor-pointer disabled:opacity-50 theme-transition"
      >
        {isPreparing ? (
          <>
            <FaSpinner className="animate-spin text-indigo-500" /> Preparing PDF...
          </>
        ) : (
          <>
            <FaDownload /> Download PDF Copy
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isPreparing}
      className="p-1 text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-455 transition-colors disabled:opacity-50 cursor-pointer"
      title="Download PDF"
    >
      {isPreparing ? (
        <FaSpinner className="animate-spin text-[10px]" />
      ) : (
        <FaFilePdf className="text-xs" />
      )}
    </button>
  );
}
