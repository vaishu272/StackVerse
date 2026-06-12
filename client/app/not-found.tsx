"use client";

import Link from "next/link";
import { FaHome, FaExclamationTriangle } from "react-icons/fa";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center theme-transition relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>

      <div className="max-w-md bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl p-8 md:p-12 shadow-xl relative">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-inner animate-bounce">
          <FaExclamationTriangle />
        </div>

        <h1 className="text-6xl font-black bg-linear-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent mb-4">
          404
        </h1>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">
          Route Gated or Not Found
        </h2>
        <p className="text-slate-550 dark:text-slate-400 text-sm leading-relaxed mb-8">
          The resources you are attempting to compile do not exist, or you lack
          the credentials to access this system path.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-slate-100 font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 text-sm cursor-pointer"
        >
          <FaHome /> Return to Feeds
        </Link>
      </div>
    </div>
  );
}
