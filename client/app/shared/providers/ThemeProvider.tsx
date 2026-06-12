"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getCookie, setCookie } from "@/shared/utils/cookieUtils";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const savedTheme = getCookie("stackverse_theme") as Theme | null;
      return savedTheme || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      document.documentElement.className = theme;
    });
    return () => cancelAnimationFrame(handle);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    setCookie("stackverse_theme", nextTheme, 365);
    document.documentElement.className = nextTheme;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
