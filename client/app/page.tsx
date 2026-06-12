"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useShallow } from "zustand/react/shallow";
import { Sparkles } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore(
    useShallow((state) => ({ user: state.user, isInitialized: state.isInitialized }))
  );

  useEffect(() => {
    if (isInitialized) {
      if (user) {
        router.push(user.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/visitor");
      } else {
        router.push("/sign-in");
      }
    }
  }, [user, isInitialized, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100 p-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-500 animate-spin"></div>
      </div>
      <h1 className="mt-6 text-xl font-bold bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent animate-pulse flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        Redirecting to StackVerse...
      </h1>
    </div>
  );
}
