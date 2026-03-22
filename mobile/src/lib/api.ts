/**
 * Muraho Rwanda Mobile — API Client
 * ===================================
 * Mirrors the web API client, adapted for React Native.
 * Uses expo-secure-store for token persistence.
 */

import * as SecureStore from "expo-secure-store";
import type { PaginatedResponse } from "@shared/types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "https://muraho.rw/api";
const TOKEN_KEY = "muraho_auth_token";

// ── Token management ──────────────────────────────────

let authToken: string | null = null;

async function getToken(): Promise<string | null> {
  if (authToken) return authToken;
  authToken = await SecureStore.getItemAsync(TOKEN_KEY);
  return authToken;
}

async function setToken(token: string | null): Promise<void> {
  authToken = token;
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

// ── Core fetch ────────────────────────────────────────

class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `JWT ${token}`;
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));

    // Auto-clear token on 401
    if (response.status === 401) {
      await setToken(null);
    }

    throw new ApiError(response.status, error.message || "Request failed", error);
  }

  return response.json();
}

// ── API Methods ───────────────────────────────────────

export const api = {
  // Collections
  async find<T = any>(collection: string, params: {
    where?: Record<string, any>;
    sort?: string;
    limit?: number;
    page?: number;
    depth?: number;
  } = {}): Promise<PaginatedResponse<T>> {
    const qs = new URLSearchParams();
    if (params.sort) qs.set("sort", params.sort);
    if (params.limit) qs.set("limit", String(params.limit));
    if (params.page) qs.set("page", String(params.page));
    if (params.depth !== undefined) qs.set("depth", String(params.depth));

    const queryStr = qs.toString();
    return apiFetch(`/${collection}${queryStr ? `?${queryStr}` : ""}`);
  },

  async findById<T = any>(collection: string, id: string, depth = 2): Promise<T> {
    return apiFetch(`/${collection}/${id}?depth=${depth}`);
  },

  // Auth
  async login(email: string, password: string) {
    const data = await apiFetch<{ user: any; token: string }>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    await setToken(data.token);
    return data;
  },

  async logout() {
    try { await apiFetch("/users/logout", { method: "POST" }); } catch {}
    await setToken(null);
  },

  async me() {
    return apiFetch("/users/me");
  },

  // Spatial
  async nearby(lat: number, lng: number, radiusKm = 10) {
    return apiFetch("/spatial/nearby", {
      method: "POST",
      body: JSON.stringify({ latitude: lat, longitude: lng, radiusKm }),
    });
  },

  async layers() {
    return apiFetch("/spatial/layers", {
      method: "POST",
      body: JSON.stringify({}),
    });
  },

  // AI
  async askRwanda(query: string, mode = "standard", language = "en") {
    return apiFetch("/ask-rwanda", {
      method: "POST",
      body: JSON.stringify({ query, mode, language, stream: false }),
    });
  },

  // Search
  async search(query: string, limit = 10) {
    return apiFetch(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  },

  // Access codes
  async redeemCode(code: string) {
    return apiFetch("/access-codes/redeem", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },
};

export { ApiError, setToken, getToken };
