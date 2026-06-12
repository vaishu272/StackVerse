"use client";
import axios from "axios";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { authService } from "@/features/auth/services/authService";
import {
  registerSchema,
  RegisterInput,
} from "@/features/auth/validations/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "VISITOR",
    },
    mode: "onChange",
  });

  const selectedRole = useWatch({ control, name: "role" });

  const onSubmit = async (data: RegisterInput) => {
    try {
      const response = await authService.register(data);

      toast.success(
        response.message ||
          "Registration successful! Please verify your email.",
      );
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.errors) {
          const backendErrors = error.response.data.errors;

          Object.keys(backendErrors).forEach((field) => {
            setError(field as keyof RegisterInput, {
              type: "server",
              message: backendErrors[field][0],
            });
          });

          toast.error("Please correct the form errors.");
        } else {
          const errorMsg =
            error.response?.data?.message ||
            "Registration failed. Please try again.";

          toast.error(errorMsg);
        }
      } else {
        toast.error("Something went wrong.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-4 md:p-10 relative overflow-hidden theme-transition">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <div className="w-full max-w-5xl bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-12 shadow-2xl transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/80">
        <div className="hidden md:flex md:col-span-5 lg:col-span-6 relative flex-col justify-between p-12 overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-linear-to-b from-indigo-950/30 via-slate-950/80 to-slate-950/95 z-10"></div>

          <Image
            src="/signup_hero.png"
            alt="StackVerse architecture visual"
            fill
            priority
            className="object-cover opacity-80 mix-blend-lighten scale-105"
          />

          <div className="relative z-20 flex items-center gap-3">
            <div className="h-9 w-9 bg-linear-to-tr from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <svg
                className="w-5 h-5 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-linear-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">
              StackVerse
            </span>
          </div>

          <div className="relative z-20 mt-auto pt-20">
            <h3 className="text-3xl font-black tracking-tight leading-tight bg-linear-to-r from-white via-indigo-100 to-slate-300 bg-clip-text text-transparent mb-4">
              Build your technical presence.
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Sign up to discover engineering articles, publish knowledge, and
              collaborate with the community.
            </p>
          </div>
        </div>

        <div className="col-span-1 md:col-span-7 lg:col-span-6 p-6 sm:p-8 flex flex-col justify-center">
          <div className="text-center mb-5">
            <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-600 via-violet-600 to-pink-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
              Create your account
            </h2>
            <p className="text-slate-505 dark:text-slate-400 text-sm mt-2">
              Join StackVerse to read, write, and share engineering insights.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Full Name (e.g. Linus Torvalds)"
                className={`w-full bg-slate-100/50 dark:bg-slate-950/80 border ${
                  errors.name
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                } rounded-lg px-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm transition-all focus:outline-none focus:ring-2`}
                {...register("name")}
              />
              <p className="min-h-4 text-rose-500 text-xs font-semibold mt-1">
                {errors.name?.message || ""}
              </p>
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Address (e.g. linus@stackverse.io)"
                className={`w-full bg-slate-100/50 dark:bg-slate-950/80 border ${
                  errors.email
                    ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                    : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                } rounded-lg px-4 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm transition-all focus:outline-none focus:ring-2`}
                {...register("email")}
              />
              <p className="min-h-4 text-rose-500 text-xs font-semibold mt-1">
                {errors.email?.message || ""}
              </p>
            </div>

            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (minimum 8 characters)"
                  className={`w-full bg-slate-100/50 dark:bg-slate-950/80 border ${
                    errors.password
                      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                      : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
                  } rounded-lg pl-4 pr-12 py-2.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm transition-all focus:outline-none focus:ring-2`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="min-h-4 text-rose-500 text-xs font-semibold mt-1">
                {errors.password?.message || ""}
              </p>
            </div>

            <div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setValue("role", "VISITOR")}
                  className={`py-2 px-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                    selectedRole === "VISITOR"
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
                  onClick={() => setValue("role", "CREATOR")}
                  className={`py-2 px-3 border rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer text-center ${
                    selectedRole === "CREATOR"
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
              <p className="min-h-4 text-rose-500 text-xs font-semibold mt-1">
                {errors.role?.message || ""}
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 cursor-pointer bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500 hover:from-indigo-600 hover:via-violet-600 hover:to-pink-600 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 relative overflow-hidden shadow-lg shadow-indigo-500/10"
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
                  Creating Account...
                </span>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-slate-900 px-2 text-slate-500 dark:text-slate-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() =>
                (window.location.href = "http://localhost:5000/api/auth/google")
              }
              className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            <button
              onClick={() =>
                (window.location.href = "http://localhost:5000/api/auth/github")
              }
              className="flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-300"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                />
              </svg>
              GitHub
            </button>
          </div>

          <div className="text-center mt-4 text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold underline underline-offset-4"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
