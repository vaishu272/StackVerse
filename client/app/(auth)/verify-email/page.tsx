"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";
import { authService } from "@/features/auth/services/authService";
import { useAuthStore } from "@/features/auth/store/auth.store";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlEmail = searchParams.get("email") || "";
  const urlOtp = searchParams.get("otp") || "";

  const [email, setEmail] = useState(urlEmail);
  const [prevUrlEmail, setPrevUrlEmail] = useState(urlEmail);
  const [otp, setOtp] = useState(urlOtp);
  const [prevUrlOtp, setPrevUrlOtp] = useState(urlOtp);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  if (urlEmail !== prevUrlEmail || urlOtp !== prevUrlOtp) {
    setPrevUrlEmail(urlEmail);
    setEmail(urlEmail);
    setPrevUrlOtp(urlOtp);
    setOtp(urlOtp);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) {
      toast.error("Please enter both your email address and the 6-digit code.");
      return;
    }

    if (otp.length !== 6 || isNaN(Number(otp))) {
      toast.error("The verification code must be a 6-digit number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authService.verifyEmail({ email, otp });
      if (response.token && response.user) {
        useAuthStore.getState().setCredentials({
          user: response.user,
          accessToken: response.token,
        });
        toast.success("Email verified and logged in successfully!");
        router.push(response.user.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/visitor");
      } else {
        toast.success(response.message || "Email verified successfully!");
        router.push("/sign-in");
      }
    } catch (error: unknown) {
      let msg = "Failed to verify email. The code may be invalid or expired.";
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error(
        "Please enter your email address to resend the verification code.",
      );
      return;
    }

    setIsResending(true);
    try {
      const response = await authService.resendVerification(email);
      toast.success(
        response.message || "Verification code resent successfully!",
      );
    } catch (error: unknown) {
      let msg = "Failed to resend verification code. Please try again.";
      if (axios.isAxiosError(error)) {
        msg = error.response?.data?.message || msg;
      }
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 shadow-xl dark:shadow-2xl transition-all duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-600 via-violet-600 to-pink-500 dark:from-indigo-400 dark:via-violet-400 dark:to-pink-400 bg-clip-text text-transparent">
          Verify Your Email
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
          We sent a 6-digit verification code to your email.
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
            Verification Code (OTP)
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500 hover:from-indigo-600 hover:via-violet-600 hover:to-pink-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 relative overflow-hidden shadow-lg shadow-indigo-500/10 cursor-pointer text-center"
        >
          {isSubmitting ? "Verifying..." : "Verify Code"}
        </button>
      </form>

      <div className="text-center mt-6">
        <button
          onClick={handleResend}
          disabled={isResending}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:opacity-50 cursor-pointer bg-transparent border-none"
        >
          {isResending
            ? "Resending Code..."
            : "Didn't receive code? Resend Code"}
        </button>
      </div>

      <div className="text-center border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 text-sm text-slate-500 dark:text-slate-400">
        <Link
          href="/sign-in"
          className="text-indigo-650 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold underline underline-offset-4"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 relative overflow-hidden theme-transition">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-650/5 dark:bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-650/5 dark:bg-pink-600/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col items-center justify-center text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
            <p className="text-slate-500">Loading page content...</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
