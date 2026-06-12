"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTheme } from "@/shared/providers/ThemeProvider";
import { authService } from "@/features/auth/services/authService";
import { useShallow } from "zustand/react/shallow";
import { optimizeCloudinaryUrl } from "@/shared/utils/imageUtils";
import {
  FaUserCircle,
  FaSignOutAlt,
  FaFeather,
  FaSun,
  FaMoon,
} from "react-icons/fa";

export default function Navbar() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, logout } = useAuthStore(
    useShallow((state) => ({ user: state.user, logout: state.logout }))
  );
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.log(err);
      // Ignored: backend log out might fail, but client should clear state anyway
    }
    logout();
    toast.success("Successfully logged out");
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full h-[70px] bg-white dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md flex items-center justify-between px-6 md:px-12 transition-all duration-300 theme-transition text-slate-800 dark:text-slate-100">
      <Link
        href="/"
        className="flex items-center gap-2 text-2xl font-black tracking-wider hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20 text-base">
          SV
        </span>
        <span className="bg-linear-to-r from-indigo-700 via-slate-800 to-slate-950 dark:from-indigo-200 dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          StackVerse
        </span>
      </Link>

      <div className="flex items-center gap-4 md:gap-6">
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:inline-block"
        >
          Home
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:inline-block mr-2"
        >
          Blogs
        </Link>

        {/* Theme Switcher Toggle */}
        {!mounted ? (
          <button
            className="flex items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer theme-transition"
            title="Switch to Light Mode"
          >
            <FaSun className="text-amber-400 text-lg" />
          </button>
        ) : (
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all cursor-pointer theme-transition"
            title={
              theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
            }
          >
            {theme === "dark" ? (
              <FaSun className="text-amber-400 text-lg" />
            ) : (
              <FaMoon className="text-indigo-600 text-lg" />
            )}
          </button>
        )}

        {!mounted ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-4 bg-slate-200 dark:bg-slate-900 rounded animate-pulse"></div>
            <div className="w-20 h-9 bg-slate-200 dark:bg-slate-900 rounded-lg animate-pulse"></div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-4 md:gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Dashboard
            </Link>

            {user.role === "CREATOR" && (
              <Link
                href="/dashboard/create"
                className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-slate-100 px-3 py-1.5 rounded-full transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <FaFeather className="text-2xs" /> Write
              </Link>
            )}

            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4 md:pl-6 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              title="View Profile Settings"
            >
              {user.avatar ? (
                <Image
                  src={optimizeCloudinaryUrl(user.avatar, 64)}
                  alt={user.name}
                  width={24}
                  height={24}
                  className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <FaUserCircle className="text-slate-500 dark:text-slate-400 text-lg" />
              )}
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden md:inline-block max-w-[120px] truncate">
                {user.name}
              </span>
              <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 hidden sm:inline-block">
                {user.role}
              </span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
              title="Logout"
            >
              <FaSignOutAlt className="text-base" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Login
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-semibold bg-linear-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-slate-100 px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-500/10"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
