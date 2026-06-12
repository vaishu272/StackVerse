import { create } from "zustand";

import { User } from "../types/auth";
import { setCookie, deleteCookie } from "@/shared/utils/cookieUtils";

export type { User };

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isInitialized: boolean;
  setCredentials: (credentials: { user: User; accessToken: string }) => void;
  setUser: (user: User) => void;
  clearCredentials: () => void;
  logout: () => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: null,
  isInitialized: false,
  setCredentials: ({ user, accessToken }) => {
    if (user && user.role) {
      setCookie("userRole", user.role, 7);
    } else {
      deleteCookie("userRole");
    }
    set({ user, accessToken, isInitialized: true });
  },
  setUser: (user) => {
    if (user && user.role) {
      setCookie("userRole", user.role, 7);
    } else {
      deleteCookie("userRole");
    }
    set({ user });
  },
  clearCredentials: () => {
    deleteCookie("userRole");
    set({ user: null, accessToken: null, isInitialized: true });
  },
  logout: () => {
    deleteCookie("userRole");
    set({ user: null, accessToken: null, isInitialized: true });
  },
  setInitialized: (initialized) => {
    set({ isInitialized: initialized });
  },
}));
