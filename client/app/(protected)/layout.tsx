"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { authService } from "@/features/auth/services/authService";
import { useTheme } from "@/shared/providers/ThemeProvider";
import { toast } from "react-hot-toast";
import { useShallow } from "zustand/react/shallow";
import {
  LayoutDashboard,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  User,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, clearCredentials } = useAuthStore(
    useShallow((state) => ({ user: state.user, clearCredentials: state.clearCredentials }))
  );
  const { theme, toggleTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearCredentials();
      toast.success("Successfully logged out.");
      router.push("/sign-in");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href:
        user?.role === "CREATOR" ? "/dashboard/creator" : "/dashboard/visitor",
    },
    ...(user?.role === "CREATOR"
      ? [
          {
            name: "Explore Feed",
            icon: Sparkles,
            href: "/dashboard/creator/feed",
          },
        ]
      : []),
    {
      name: "Profile",
      icon: User,
      href: "/dashboard/profile",
    },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800/80 p-6 relative">
        <div className="flex items-center justify-between gap-3 mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-linear-to-tr from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-linear-to-r from-indigo-600 to-pink-500 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent truncate">
              StackVerse
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 shadow-xs border border-indigo-100/50 dark:border-indigo-950/50"
                    : "text-slate-650 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4.5 h-4.5 transition-transform group-hover:scale-110 ${isActive ? "text-indigo-500 dark:text-indigo-400" : ""}`}
                  />
                  {item.name}
                </div>
                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                )}
              </Link>
            );
          })}

          {/* Sign Out Button in Nav List */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all group text-rose-650 hover:bg-rose-500/5 hover:text-rose-700 dark:text-rose-455 dark:hover:bg-rose-500/10 cursor-pointer text-left"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-4.5 h-4.5 transition-transform group-hover:scale-110" />
              Sign Out
            </div>
          </button>
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="md:hidden flex items-center justify-between h-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 px-6 z-30">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-linear-to-tr from-indigo-500 to-pink-500 rounded-lg flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-linear-to-r from-indigo-600 to-pink-500 dark:from-indigo-400 dark:to-pink-400 bg-clip-text text-transparent">
              StackVerse
            </span>
          </div>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 border border-slate-200 dark:border-slate-800/80 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            {isMobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </header>

        {/* Mobile Navigation Menu Drawer */}
        {isMobileOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/85 shadow-lg p-6 space-y-6 z-20 animate-fade-in">
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border border-indigo-100/50"
                        : "text-slate-650 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/40 hover:text-slate-800 dark:hover:text-slate-100"
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {item.name}
                  </Link>
                );
              })}

              {/* Sign Out inside mobile menu list */}
              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-rose-650 hover:bg-rose-500/5 hover:text-rose-700 dark:text-rose-455 dark:hover:bg-rose-500/10 cursor-pointer text-left"
              >
                <LogOut className="w-4.5 h-4.5" />
                Sign Out
              </button>
            </nav>

            <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Theme
              </span>
              <button
                onClick={toggleTheme}
                className="p-2 border border-slate-200 dark:border-slate-800/80 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/40 text-slate-500 dark:text-slate-400 cursor-pointer"
              >
                {theme === "dark" ? (
                  <Sun className="w-4.5 h-4.5" />
                ) : (
                  <Moon className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
