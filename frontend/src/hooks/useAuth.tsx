/**
 * useAuth — Authentication hook
 * ==============================
 * Replaces: Legacy auth provider
 * Backend: Payload CMS auth endpoints (/api/users/login, /api/users/me, etc.)
 *
 * Used by: AuthPage, VRAdmin, ExhibitionAdmin, TestimonyAdmin, DocumentaryAdmin,
 *          AdminDashboard, AIAdmin, MapControlPanel, ProfilePage, AccessOptionsModal,
 *          AccessStatusWidget, all agency pages
 *
 * Interface kept identical to what components already consume:
 *   const { user, loading, roles, isAdmin, signIn, signUp, signOut } = useAuth()
 */

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  useRef,
} from "react";
import { api, ApiError } from "@/lib/api/client";

// ── Types ─────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: "user" | "moderator" | "agency_admin" | "admin";
  accessTier: "free" | "day_pass" | "subscriber" | "agency";
  preferredLanguage: "en" | "fr" | "rw";
  avatar?: { url: string } | null;
  createdAt: string;
  updatedAt: string;
}

// Alias for backward compatibility with AppHeader
export type AppRole = User["role"];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  roles: string[];
  isAdmin: () => boolean;
  isAgency: () => boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// ── Constants ─────────────────────────────────────────

const TOKEN_REFRESH_INTERVAL = 10 * 60 * 1000; // Refresh session every 10 minutes
const SESSION_CHECK_INTERVAL = 60 * 1000; // Check session validity every minute

const ROLE_PRIORITY: Array<User["role"]> = [
  "admin",
  "moderator",
  "agency_admin",
  "user",
];

const resolveRole = (raw: any): User["role"] => {
  const candidates = [
    raw?.role,
    ...(Array.isArray(raw?.roles) ? raw.roles : []),
  ]
    .map((value) =>
      typeof value === "string" ? value.trim().toLowerCase() : "",
    )
    .filter(Boolean);

  for (const role of ROLE_PRIORITY) {
    if (candidates.includes(role)) {
      return role;
    }
  }

  return "user";
};

const normalizeUser = (raw: any): User => {
  const role = resolveRole(raw);
  return {
    id: raw.id,
    email: raw.email,
    fullName: raw.fullName || undefined,
    role,
    accessTier: raw.accessTier || "free",
    preferredLanguage: raw.preferredLanguage || "en",
    avatar: raw.avatar || null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
};

// ── Context ───────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastRefreshRef = useRef<number>(0);

  // ── Fetch current user ────────────────────────────

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.me();
      const raw = response?.user ?? null;

      if (!raw) {
        setUser(null);
        setRoles([]);
        lastRefreshRef.current = Date.now();
        return;
      }

      const userData = normalizeUser(raw);
      setUser(userData);
      setRoles([userData.role]);
      lastRefreshRef.current = Date.now();
    } catch (err) {
      // Session expired or not authenticated
      if (err instanceof ApiError && err.status === 401) {
        // Try to refresh the token once
        try {
          const refreshResponse = await api.refreshToken();
          if (refreshResponse?.user) {
            const raw = refreshResponse.user;
            const refreshedUser = normalizeUser(raw);
            setUser(refreshedUser);
            setRoles([refreshedUser.role]);
            lastRefreshRef.current = Date.now();
            return;
          }
        } catch {
          // Refresh failed — session is truly expired
        }
      }
      setUser(null);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Initial load + periodic refresh ───────────────

  useEffect(() => {
    refreshUser();

    // Set up periodic session refresh
    refreshTimerRef.current = setInterval(() => {
      const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
      if (timeSinceLastRefresh >= TOKEN_REFRESH_INTERVAL) {
        refreshUser();
      }
    }, SESSION_CHECK_INTERVAL);

    // Refresh on window focus (user comes back to tab)
    const handleFocus = () => {
      const timeSinceLastRefresh = Date.now() - lastRefreshRef.current;
      if (timeSinceLastRefresh >= TOKEN_REFRESH_INTERVAL) {
        refreshUser();
      }
    };
    window.addEventListener("focus", handleFocus);

    // Refresh on online (connection restored)
    const handleOnline = () => refreshUser();
    window.addEventListener("online", handleOnline);

    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("online", handleOnline);
    };
  }, [refreshUser]);

  // ── Sign in ───────────────────────────────────────

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: any | null }> => {
      try {
        const response = await api.login(email, password);
        const raw = response?.user;
        if (!raw) {
          return { error: { message: "Authentication failed" } };
        }
        const userData = normalizeUser(raw);
        setUser(userData);
        setRoles([userData.role]);
        return { error: null };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "An unexpected error occurred";
        return { error: { message } };
      }
    },
    [],
  );

  // ── Sign up ───────────────────────────────────────

  const signUp = useCallback(
    async (email: string, password: string): Promise<{ error: any | null }> => {
      try {
        await api.register(email, password);
        return { error: null };
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "An unexpected error occurred";
        return { error: { message } };
      }
    },
    [],
  );

  // ── Sign out ──────────────────────────────────────

  const signOut = useCallback(async () => {
    try {
      await api.logout();
    } catch (error) {
      // Log but don't fail - backend logout might have succeeded
      console.error("Logout error:", error);
    }
    // Clear all local state
    setUser(null);
    setRoles([]);
    // Force hard refresh to clear all client-side caches and cookies
    window.location.href = "/";
  }, []);

  // ── Role checks ───────────────────────────────────

  const isAdmin = useCallback(() => {
    return user?.role === "admin";
  }, [user]);

  const isAgency = useCallback(() => {
    return user?.role === "agency_admin";
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        roles,
        isAdmin,
        isAgency,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
