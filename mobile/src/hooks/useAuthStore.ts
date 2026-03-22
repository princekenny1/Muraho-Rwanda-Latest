/**
 * Auth Store — Zustand-based auth state for mobile.
 *
 * Usage:
 *   const { user, isLoading, signIn, signOut } = useAuthStore();
 */

import { create } from "zustand";
import { api, getToken } from "@/lib/api";
import type { User } from "@shared/types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      const token = await getToken();
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const response = await api.me();
      const user = response.user || response;
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const { user } = await api.login(email, password);
      set({ user, isAuthenticated: true });
      return {};
    } catch (err: any) {
      return { error: err.message || "Sign in failed" };
    }
  },

  signOut: async () => {
    await api.logout();
    set({ user: null, isAuthenticated: false });
  },

  refreshUser: async () => {
    try {
      const response = await api.me();
      const user = response.user || response;
      set({ user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    }
  },
}));
