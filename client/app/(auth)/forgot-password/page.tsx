"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { authService } from "@/features/auth/services/authService";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.forgotPassword(email);
      toast.success(
        response.message ||
          "Password reset OTP code sent! Please check your email.",
      );
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      let msg = "Something went wrong. Please try again.";
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 relative overflow-hidden theme-transition">
      {/* Background Neon Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-650/5 dark:bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-650/5 dark:bg-violet-600/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 shadow-xl dark:shadow-2xl transition-all duration-300">
        {!submitted ? (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-600 via-violet-600 to-pink-500 dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
                Forgot Password
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="linus@stackverse.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-100/50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg px-4 py-3 text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm transition-all focus:outline-none focus:ring-2"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500 hover:from-indigo-600 hover:via-violet-600 hover:to-pink-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 relative overflow-hidden shadow-lg shadow-indigo-500/10 cursor-pointer text-center"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending link...
                  </span>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950/40 text-indigo-500 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/10 animate-bounce">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Check Your Email
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              If an account is registered with <strong>{email}</strong>, we have
              dispatched a password reset link. Please check your inbox (and
              spam folder).
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-semibold text-slate-400 hover:text-indigo-500 dark:text-slate-500 dark:hover:text-indigo-400 transition-colors cursor-pointer mb-6"
            >
              Didn&apos;t receive email? Try again
            </button>
          </div>
        )}

        <div className="text-center border-t border-slate-100 dark:border-slate-800 pt-6 text-sm text-slate-500 dark:text-slate-400">
          Remember your password?{" "}
          <Link
            href="/sign-in"
            className="text-indigo-650 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
