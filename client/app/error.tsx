"use client";

import { useEffect } from "react";
import Link from "next/link";
import { FaHome, FaSync, FaExclamationTriangle } from "react-icons/fa";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to console or telemetry
    console.error("Application Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center theme-transition relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse delay-500"></div>

      <div className="max-w-md w-full bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 md:p-12 shadow-xl relative">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner animate-pulse">
          <FaExclamationTriangle />
        </div>

        <h1 className="text-3xl font-black bg-linear-to-r from-rose-500 via-red-500 to-orange-500 bg-clip-text text-transparent mb-4">
          Something went wrong!
        </h1>

        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
          An unexpected error occurred during execution. StackVerse engine
          reports:
        </p>

        {/* Display Error Message in a styled container */}
        <div className="bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 mb-8 text-left overflow-x-auto max-h-36 shadow-inner">
          <code className="text-xs font-mono text-rose-600 dark:text-rose-400 break-all">
            {error.message || "Unknown error occurred"}
          </code>
          {error.digest && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
              Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-slate-100 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm cursor-pointer"
          >
            <FaSync className="text-xs" /> Try Again
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-250 font-semibold px-6 py-3 rounded-xl transition-all text-sm cursor-pointer"
          >
            <FaHome /> Return to Feeds
          </Link>
        </div>
      </div>
    </div>
  );
}
