"use client";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center text-slate-800 dark:text-slate-100 p-6 theme-transition">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
      </div>
      <h2 className="mt-6 text-lg font-bold bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent animate-pulse">
        Compiling Page...
      </h2>
    </div>
  );
}
