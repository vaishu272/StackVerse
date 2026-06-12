"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { authService } from "@/features/auth/services/authService";
import { useShallow } from "zustand/react/shallow";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isInitialized } = useAuthStore(
    useShallow((state) => ({ user: state.user, isInitialized: state.isInitialized }))
  );
  const setCredentials = useAuthStore((state) => state.setCredentials);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const clearCredentials = useAuthStore((state) => state.clearCredentials);

  const authPages = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/auth-callback",
  ];
  const isAuthPage = authPages.includes(pathname);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await authService.refresh();
        setCredentials({ user: data.user, accessToken: data.token || "" });
      } catch {
        clearCredentials();
      } finally {
        setInitialized(true);
      }
    };

    initAuth();
  }, [setCredentials, setInitialized, clearCredentials]);

  // Route gating redirects
  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      // Unauthenticated users
      if (!isAuthPage && pathname !== "/") {
        router.push("/sign-in");
      }
    } else {
      // Authenticated users
      const targetDashboard = user.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/visitor";

      // Redirect away from auth pages or root index to dashboard
      // We exclude /auth-callback from automatic redirect so the onboarding form can be rendered
      if ((isAuthPage && pathname !== "/auth-callback") || pathname === "/") {
        router.push(targetDashboard);
      } 
      // Handle base /dashboard pathname
      else if (pathname === "/dashboard") {
        router.push(targetDashboard);
      }
      // Gate role-specific dashboards
      else if (pathname.startsWith("/dashboard/creator") && user.role !== "CREATOR") {
        router.push("/dashboard/visitor");
      } else if (pathname.startsWith("/dashboard/visitor") && user.role !== "VISITOR") {
        router.push("/dashboard/creator");
      } else if (pathname.startsWith("/editor") && user.role !== "CREATOR") {
        router.push("/dashboard/visitor");
      }
    }
  }, [user, isInitialized, pathname, isAuthPage, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
        </div>
        <h1 className="mt-6 text-xl font-bold bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent animate-pulse">
          Loading StackVerse...
        </h1>
      </div>
    );
  }

  // Prevent rendering protected content while redirecting a non-authenticated user
  if (!user && !isAuthPage && pathname !== "/") {
    return null;
  }

  // Prevent rendering auth page while redirecting an already authenticated user
  // We exclude /auth-callback here so the onboarding flow layout can render
  if (user && ((isAuthPage && pathname !== "/auth-callback") || pathname === "/" || pathname === "/dashboard")) {
    return null;
  }

  // Prevent rendering incorrect role dashboard/editor while redirecting
  if (user) {
    if (pathname.startsWith("/dashboard/creator") && user.role !== "CREATOR") {
      return null;
    }
    if (pathname.startsWith("/dashboard/visitor") && user.role !== "VISITOR") {
      return null;
    }
    if (pathname.startsWith("/editor") && user.role !== "CREATOR") {
      return null;
    }
  }

  return <>{children}</>;
}
