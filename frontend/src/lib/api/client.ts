/**
 * Muraho Rwanda — API Client
 * ===========================
 * Replaces: @/lib/api/client
 *
 * Usage:
 *   import { api } from "@/lib/api/client"
 *   const stories = await api.find("stories", { limit: 10, sort: "-createdAt" })
 *   const story = await api.findOne("stories", { slug: "kigali-memorial" })
 */

const normalizeApiBase = (rawBase?: string): string => {
  const trimmed = (rawBase || "").trim().replace(/\/+$/, "");

  if (!trimmed) return "/api";
  if (trimmed === "/api" || trimmed.endsWith("/api")) return trimmed;

  // Allow VITE_API_URL to be either "http://host:port" or "http://host:port/api"
  if (/^https?:\/\//i.test(trimmed)) {
    // In local browser dev, prefer same-origin proxy to preserve cookie auth.
    if (typeof window !== "undefined") {
      const isLocalHost = ["localhost", "127.0.0.1"].includes(
        window.location.hostname,
      );
      if (isLocalHost) return "/api";
    }
    return `${trimmed}/api`;
  }

  return trimmed;
};

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);
const AUTH_TOKEN_STORAGE_KEY = "mrw.auth.token";

const hasLocalStorage = (): boolean => {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
};

const getStoredToken = (): string | null => {
  if (!hasLocalStorage()) return null;
  return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
};

const setStoredToken = (token: string | null): void => {
  if (!hasLocalStorage()) return;
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
};

// ── Types ─────────────────────────────────────────────

interface FindOptions {
  where?: Record<string, any>;
  sort?: string;
  limit?: number;
  page?: number;
  depth?: number;
}

interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

interface AuthResponse {
  user: any;
  token: string;
  exp: number;
}

// ── Where clause builder ──────────────────────────────

function buildWhereParams(
  where: Record<string, any>,
  prefix = "where",
): URLSearchParams {
  const params = new URLSearchParams();

  function flatten(obj: Record<string, any>, path: string) {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = `${path}[${key}]`;
      if (value && typeof value === "object" && !Array.isArray(value)) {
        flatten(value, newPath);
      } else {
        params.set(newPath, String(value));
      }
    }
  }

  flatten(where, prefix);
  return params;
}

// ── Core fetch wrapper ────────────────────────────────

async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const token = getStoredToken();

  const response = await fetch(url, {
    credentials: "include", // Send httpOnly cookies (JWT)
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (!response.ok) {
    const error = isJson
      ? await response.json().catch(() => ({ message: response.statusText }))
      : { message: await response.text().catch(() => response.statusText) };
    throw new ApiError(
      response.status,
      error.message || error.error || "Request failed",
      error,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (isJson) {
    return response.json();
  }

  return (await response.text()) as T;
}

// ── Error class ───────────────────────────────────────

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

// ── API Client ────────────────────────────────────────

export const api = {
  /** Base URL for direct fetch calls */
  baseURL: API_BASE,

  // ── Collection CRUD ───────────────────────────────

  /** Find documents in a collection */
  async find<T = any>(
    collection: string,
    options: FindOptions = {},
  ): Promise<PaginatedResponse<T>> {
    const params = new URLSearchParams();
    if (options.sort) params.set("sort", options.sort);
    if (options.limit) params.set("limit", String(options.limit));
    if (options.page) params.set("page", String(options.page));
    if (options.depth !== undefined) params.set("depth", String(options.depth));

    if (options.where) {
      const whereParams = buildWhereParams(options.where);
      whereParams.forEach((value, key) => params.set(key, value));
    }

    const qs = params.toString();
    return apiFetch(`/${collection}${qs ? `?${qs}` : ""}`);
  },

  /** Find a single document by field match */
  async findOne<T = any>(
    collection: string,
    where: Record<string, any>,
    depth = 2,
  ): Promise<T | null> {
    const result = await this.find<T>(collection, { where, limit: 1, depth });
    return result.docs[0] || null;
  },

  /** Get a document by ID */
  async findById<T = any>(
    collection: string,
    id: string,
    depth = 2,
  ): Promise<T> {
    return apiFetch(`/${collection}/${id}?depth=${depth}`);
  },

  /** Create a document */
  async create<T = any>(
    collection: string,
    data: Record<string, any>,
  ): Promise<T> {
    return apiFetch(`/${collection}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Update a document */
  async update<T = any>(
    collection: string,
    id: string,
    data: Record<string, any>,
  ): Promise<T> {
    return apiFetch(`/${collection}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  /** Delete a document */
  async delete(collection: string, id: string): Promise<void> {
    return apiFetch(`/${collection}/${id}`, { method: "DELETE" });
  },

  // ── Auth ──────────────────────────────────────────

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiFetch<AuthResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (response?.token) {
      setStoredToken(response.token);
    }
    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch("/users/logout", { method: "POST" });
    } finally {
      setStoredToken(null);
    }
  },

  async me(): Promise<any> {
    return apiFetch("/users/me");
  },

  /** Refresh the auth token (Payload CMS refresh endpoint) */
  async refreshToken(): Promise<AuthResponse | null> {
    try {
      const response = await apiFetch<AuthResponse>("/users/refresh-token", {
        method: "POST",
      });
      if (response?.token) {
        setStoredToken(response.token);
      }
      return response;
    } catch {
      return null;
    }
  },

  async register(
    email: string,
    password: string,
    fullName?: string,
  ): Promise<any> {
    return apiFetch("/users", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName }),
    });
  },

  async forgotPassword(email: string): Promise<void> {
    return apiFetch("/users/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    return apiFetch("/users/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  },

  // ── Custom Endpoints ──────────────────────────────

  /** Redeem an access code */
  async redeemCode(code: string): Promise<{
    success: boolean;
    accessLevel: string;
    expiresAt: string;
    agencyName: string;
  }> {
    return apiFetch("/access-codes/redeem", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  /** Get nearby locations (PostGIS) */
  async nearbyLocations(lat: number, lng: number, radius = 5000, limit = 20) {
    return apiFetch(
      `/locations/nearby?lat=${lat}&lng=${lng}&radius=${radius}&limit=${limit}`,
    );
  },

  /** Get all locations as GeoJSON */
  async geojson() {
    return apiFetch("/locations/geojson");
  },

  /** Sync user progress */
  async syncProgress(data: {
    contentId: string;
    contentType: string;
    progressSeconds: number;
    totalDurationSeconds?: number;
    completed?: boolean;
    contentTitle?: string;
    contentImage?: string;
  }) {
    return apiFetch("/user-progress/sync", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Search across collections */
  async search(query: string, types?: string[], limit = 10) {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    if (types) params.set("types", types.join(","));
    return apiFetch(`/search?${params}`);
  },

  /** Ask Rwanda AI chat */
  async askRwanda(data: {
    query: string;
    mode?: "standard" | "personal_voices" | "kid_friendly";
    context?: { type: string; id: string; title?: string };
    language?: string;
    stream?: boolean;
  }) {
    if (data.stream) {
      // Return SSE EventSource for streaming
      const response = await fetch(`${API_BASE}/ask-rwanda`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response; // Caller handles ReadableStream
    }
    return apiFetch("/ask-rwanda", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ── Globals ───────────────────────────────────────

  async getGlobal<T = any>(slug: string): Promise<T> {
    return apiFetch(`/globals/${slug}`);
  },

  async updateGlobal<T = any>(
    slug: string,
    data: Record<string, any>,
  ): Promise<T> {
    return apiFetch(`/globals/${slug}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // ── Media Upload ──────────────────────────────────

  async uploadMedia(file: File, alt?: string): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    if (alt) formData.append("alt", alt);

    return fetch(`${API_BASE}/media`, {
      method: "POST",
      credentials: "include",
      body: formData,
      // Don't set Content-Type — browser sets multipart boundary
    }).then((r) => r.json());
  },

  // ── Payments ──────────────────────────────────────

  async createCheckout(data: {
    type: "subscription" | "one_time" | "day_pass" | "agency";
    plan?: "monthly" | "annual";
    gateway?: "stripe" | "flutterwave";
    amount?: number;
    contentId?: string;
    agencyId?: string;
    returnUrl?: string;
  }): Promise<{ checkoutUrl: string; sessionId: string; gateway: string }> {
    return apiFetch("/payments/create-checkout", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async cancelSubscription(
    subscriptionId: string,
  ): Promise<{ success: boolean }> {
    return apiFetch(`/payments/cancel-subscription`, {
      method: "POST",
      body: JSON.stringify({ subscriptionId }),
    });
  },

  // ── Analytics Events ──────────────────────────────

  async trackEvent(data: {
    eventType: string;
    contentType?: string;
    contentId?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    // Fire-and-forget — don't block UI
    apiFetch("/analytics/track", {
      method: "POST",
      body: JSON.stringify(data),
    }).catch(() => {
      /* silently fail */
    });
  },
};
