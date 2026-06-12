"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { authService } from "@/features/auth/services/authService";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(urlEmail);
  const [prevUrlEmail, setPrevUrlEmail] = useState(urlEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (urlEmail !== prevUrlEmail) {
    setPrevUrlEmail(urlEmail);
    setEmail(urlEmail);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !otp || !password) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (otp.length !== 6 || isNaN(Number(otp))) {
      toast.error("The reset OTP code must be a 6-digit number.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.resetPassword({
        email,
        otp,
        password,
      });
      toast.success(
        response.message || "Password reset successful! Please log in.",
      );
      router.push("/sign-in");
    } catch (error: unknown) {
      let msg = "Reset failed. The OTP code may be invalid or expired.";
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-600 via-violet-600 to-pink-500 dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
          Reset Password
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          Enter the 6-digit OTP code sent to your email and select your new
          password.
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

        <div>
          <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Reset OTP Code
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="w-full bg-slate-100/50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg px-4 py-3 text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-center text-2xl font-bold tracking-widest transition-all focus:outline-none focus:ring-2"
            required
          />
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
            New Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-100/50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg px-4 py-3 text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm transition-all focus:outline-none focus:ring-2"
            required
            minLength={8}
          />
        </div>

        <div>
          <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-slate-100/50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-lg px-4 py-3 text-slate-850 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm transition-all focus:outline-none focus:ring-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500 hover:from-indigo-600 hover:via-violet-600 hover:to-pink-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 relative overflow-hidden shadow-lg shadow-indigo-500/10 cursor-pointer text-center"
        >
          {isSubmitting ? "Updating password..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 relative overflow-hidden theme-transition">
      {/* Background Neon Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-650/5 dark:bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-650/5 dark:bg-pink-600/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 shadow-xl dark:shadow-2xl transition-all duration-300">
        <Suspense
          fallback={
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-slate-500">Loading form content...</p>
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>

        <div className="text-center border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 text-sm text-slate-500 dark:text-slate-400">
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
