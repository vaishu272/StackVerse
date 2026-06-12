"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { toast } from "react-hot-toast";
import { useShallow } from "zustand/react/shallow";

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function RouteGuard({
  children,
  allowedRoles,
}: RouteGuardProps) {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      isInitialized: state.isInitialized,
    })),
  );

  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      toast.error("Please login to access this page");
      router.push("/sign-in");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      toast.error("You are not authorized to view this page");
      router.push("/");
      return;
    }
  }, [user, isInitialized, allowedRoles, router]);

  // Prevent flashing of children if not authenticated/authorized
  if (
    !isInitialized ||
    !user ||
    (allowedRoles && !allowedRoles.includes(user.role))
  ) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
      </div>
    );
  }

  return <>{children}</>;
}
