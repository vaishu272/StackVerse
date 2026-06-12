"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { authService } from "@/features/auth/services/authService";
import { toast } from "react-hot-toast";
import { Sparkles } from "lucide-react";
import axios from "axios";

function AuthCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"VISITOR" | "CREATOR">("VISITOR");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (!token) {
        toast.error("Authentication token missing.");
        router.push("/sign-in");
        return;
      }

      try {
        // Set temp credentials with the access token
        // The getMe request will fetch and save the actual profile
        setCredentials({
          user: { id: "", name: "", email: "", role: "VISITOR" },
          accessToken: token,
        });

        const meResponse = await authService.getMe();
        setCredentials({ user: meResponse.user, accessToken: token });

        const isNew = searchParams.get("new") === "true";
        if (isNew) {
          setLoading(false);
        } else {
          // If not a new user, redirect directly to dashboard
          const target =
            meResponse.user.role === "CREATOR"
              ? "/dashboard/creator"
              : "/dashboard/visitor";
          router.push(target);
        }
      } catch {
        toast.error("Failed to authenticate session.");
        router.push("/sign-in");
      }
    };

    handleCallback();
  }, [token, searchParams, setCredentials, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const onboardResponse = await authService.onboard({
        role,
      });

      // Update credentials with the freshly onboarded user details
      if (token) {
        setCredentials({ user: onboardResponse.user, accessToken: token });
      }

      toast.success("Profile setup completed successfully!");
      const target =
        onboardResponse.user.role === "CREATOR"
          ? "/dashboard/creator"
          : "/dashboard/visitor";
      router.push(target);
    } catch (err: unknown) {
      let msg = "Failed to finalize profile setup. Please try again.";
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-12">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
        </div>
        <h3 className="text-xl font-bold bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent animate-pulse flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Synchronizing StackVerse Profile...
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
          Retrieving secure authentication keys and profile records.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 shadow-xl dark:shadow-2xl transition-all duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-650 via-violet-650 to-pink-500 dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
          Welcome to StackVerse
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          Let&apos;s finalize your engineering profile configuration.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-slate-655 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">
            I want to participate as a:
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setRole("VISITOR")}
              className={`py-3 px-4 border rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                role === "VISITOR"
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 ring-2 ring-indigo-500/20"
                  : "border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-750"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="text-sm font-bold">Visitor</span>
              <span className="text-[10px] text-slate-400">
                Read & learn insights
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("CREATOR")}
              className={`py-3 px-4 border rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                role === "CREATOR"
                  ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-650 dark:text-indigo-400 ring-2 ring-indigo-500/20"
                  : "border-slate-200 dark:border-slate-800 bg-transparent text-slate-500 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-750"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <span className="text-sm font-bold">Creator</span>
              <span className="text-[10px] text-slate-400">
                Publish design write-ups
              </span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500 hover:from-indigo-600 hover:via-violet-600 hover:to-pink-600 disabled:opacity-50 text-white font-semibold py-3.5 px-4 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 relative overflow-hidden shadow-lg shadow-indigo-500/10 cursor-pointer text-center"
        >
          {isSubmitting ? "Finalizing Setup..." : "Complete Setup"}
        </button>
      </form>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 relative overflow-hidden theme-transition">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-650/5 dark:bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-650/5 dark:bg-pink-600/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-slate-500">Redirecting to callback...</p>
          </div>
        }
      >
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
