"use client";
import axios from "axios";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { authService } from "@/features/auth/services/authService";
import {
  registerSchema,
  RegisterInput,
} from "@/features/auth/validations/auth";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();

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

          // Map structured backend validation errors to form fields
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
    <div className="min-h-[calc(100vh-70px)] bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex items-center justify-center p-6 relative overflow-hidden theme-transition">
      {/* Background Neon Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/5 dark:bg-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/5 dark:bg-violet-600/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-8 shadow-xl dark:shadow-2xl transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700/80">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-indigo-600 via-violet-600 to-pink-500 dark:from-indigo-400 dark:via-violet-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Join StackVerse
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
            Create an account to read and publish engineering insights
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Linus Torvalds"
              className={`w-full bg-slate-100/50 dark:bg-slate-950/80 border ${
                errors.name
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
              } rounded-lg px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm transition-all focus:outline-none focus:ring-2`}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-rose-500 text-xs font-semibold mt-1.5">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="linus@stackverse.io"
              className={`w-full bg-slate-100/50 dark:bg-slate-950/80 border ${
                errors.email
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
              } rounded-lg px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm transition-all focus:outline-none focus:ring-2`}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-rose-500 text-xs font-semibold mt-1.5">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className={`w-full bg-slate-100/50 dark:bg-slate-950/80 border ${
                errors.password
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20"
              } rounded-lg px-4 py-3 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 text-sm transition-all focus:outline-none focus:ring-2`}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-rose-500 text-xs font-semibold mt-1.5">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-600 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("role", "VISITOR")}
                className={`py-3 px-4 rounded-lg text-sm font-medium border transition-all duration-200 cursor-pointer ${
                  selectedRole === "VISITOR"
                    ? "bg-indigo-50 dark:bg-indigo-600/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-lg shadow-indigo-500/5"
                    : "bg-slate-100/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Visitor
              </button>
              <button
                type="button"
                onClick={() => setValue("role", "CREATOR")}
                className={`py-3 px-4 rounded-lg text-sm font-medium border transition-all duration-200 cursor-pointer ${
                  selectedRole === "CREATOR"
                    ? "bg-violet-50 dark:bg-violet-600/20 border-violet-500 text-violet-700 dark:text-violet-300 shadow-lg shadow-violet-500/5"
                    : "bg-slate-100/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                Creator
              </button>
            </div>
            {errors.role && (
              <p className="text-rose-500 text-xs font-semibold mt-1.5">
                {errors.role.message}
              </p>
            )}
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 italic">
              {selectedRole === "VISITOR"
                ? "* Visitors can explore blogs and engage with articles."
                : "* Creators can draft, publish, and manage engineering write-ups."}
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 cursor-pointer bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500 hover:from-indigo-600 hover:via-violet-600 hover:to-pink-600 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 relative overflow-hidden shadow-lg shadow-indigo-500/10"
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

        <div className="relative my-6">
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
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-300"
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
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-300"
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

        <div className="text-center mt-6 text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold underline underline-offset-4"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
