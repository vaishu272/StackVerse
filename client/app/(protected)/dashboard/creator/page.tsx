"use client";

import React from "react";
import dynamic from "next/dynamic";
import RouteGuard from "@/features/auth/components/RouteGuard";
import { Loader2 } from "lucide-react";

const CreatorDashboard = dynamic(
  () => import("@/features/dashboard/components/CreatorDashboard"),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 theme-transition">
        <Loader2 className="animate-spin text-indigo-600 text-3xl" />
        <p className="mt-3 text-slate-500 dark:text-slate-400 font-medium text-sm">
          Loading studio dashboard...
        </p>
      </div>
    ),
  },
);

export default function CreatorDashboardPage() {
  return (
    <RouteGuard allowedRoles={["CREATOR"]}>
      <CreatorDashboard />
    </RouteGuard>
  );
}
