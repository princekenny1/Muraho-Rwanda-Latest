/**
 * Hook Integration Tests
 * =======================
 * Tests API client methods and hook behavior against a running backend.
 *
 * Run: npx vitest tests/hooks/
 * Requires: TEST_API_URL env variable pointing to running Payload CMS
 */

import { describe, it, expect, beforeAll } from "vitest";

const API_URL = process.env.TEST_API_URL || "http://localhost:3000/api";

// ── Helper ────────────────────────────────────────────

async function apiFetch(path: string, options: RequestInit = {}) {
  const resp = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  return { status: resp.status, data: await resp.json().catch(() => null) };
}

let adminToken: string;

beforeAll(async () => {
  try {
    const resp = await apiFetch("/users/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@muraho.rw", password: "MurahoAdmin2026!" }),
    });
    adminToken = resp.data?.token;
  } catch {
    console.warn("Could not authenticate — some tests will be skipped");
  }
});

// ══════════════════════════════════════════════════════════
//  API CLIENT — COLLECTION OPERATIONS
// ══════════════════════════════════════════════════════════

describe("API Client — Collections", () => {
  it("should list museums", async () => {
    const { status, data } = await apiFetch("/museums?limit=5");
    expect(status).toBe(200);
    expect(data).toHaveProperty("docs");
    expect(data).toHaveProperty("totalDocs");
    expect(Array.isArray(data.docs)).toBe(true);
  });

  it("should list stories with pagination", async () => {
    const { status, data } = await apiFetch("/stories?limit=3&page=1&sort=-createdAt");
    expect(status).toBe(200);
    expect(data).toHaveProperty("totalPages");
    expect(data).toHaveProperty("page");
  });

  it("should find museum by slug", async () => {
    const { status, data } = await apiFetch(
      "/museums?where[slug][equals]=kigali-genocide-memorial&limit=1"
    );
    expect(status).toBe(200);
    if (data.totalDocs > 0) {
      expect(data.docs[0].slug).toBe("kigali-genocide-memorial");
    }
  });

  it("should find routes with depth", async () => {
    const { status, data } = await apiFetch("/routes?limit=5&depth=1");
    expect(status).toBe(200);
    expect(Array.isArray(data.docs)).toBe(true);
  });

  it("should handle empty collection gracefully", async () => {
    const { status, data } = await apiFetch("/user-progress?limit=1");
    expect(status).toBe(200);
    expect(data.docs).toHaveLength(0);
  });
});

// ══════════════════════════════════════════════════════════
//  AUTH FLOW
// ══════════════════════════════════════════════════════════

describe("Auth Flow", () => {
  it("should login and return token + user", async () => {
    const { status, data } = await apiFetch("/users/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@muraho.rw", password: "MurahoAdmin2026!" }),
    });
    expect(status).toBe(200);
    expect(data).toHaveProperty("token");
    expect(data).toHaveProperty("user");
    expect(data.user.email).toBe("admin@muraho.rw");
  });

  it("should reject wrong password", async () => {
    const { status } = await apiFetch("/users/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@muraho.rw", password: "wrong" }),
    });
    expect([400, 401]).toContain(status);
  });

  it("should return user for valid token", async () => {
    if (!adminToken) return;
    const { status, data } = await apiFetch("/users/me", {
      headers: { Authorization: `JWT ${adminToken}` },
    });
    expect(status).toBe(200);
    expect(data.user?.role || data.role).toBe("admin");
  });

  it("should reject unauthenticated /me", async () => {
    const { status } = await apiFetch("/users/me");
    expect(status).toBe(401);
  });
});

// ══════════════════════════════════════════════════════════
//  SPATIAL API
// ══════════════════════════════════════════════════════════

describe("Spatial API", () => {
  it("should return nearby points", async () => {
    const { status, data } = await apiFetch("/spatial/nearby", {
      method: "POST",
      body: JSON.stringify({ latitude: -1.9403, longitude: 29.8739, radiusKm: 15 }),
    });
    expect(status).toBe(200);
    expect(data).toHaveProperty("points");
    expect(Array.isArray(data.points)).toBe(true);
  });

  it("should return layers with route lines", async () => {
    const { status, data } = await apiFetch("/spatial/layers", {
      method: "POST",
      body: JSON.stringify({}),
    });
    expect(status).toBe(200);
    expect(data).toHaveProperty("layers");
    expect(data).toHaveProperty("routeLines");
  });

  it("should return points within bounding box", async () => {
    const { status, data } = await apiFetch("/spatial/bbox", {
      method: "POST",
      body: JSON.stringify({ north: -1.5, south: -2.5, east: 30.5, west: 28.5 }),
    });
    expect(status).toBe(200);
    expect(data).toHaveProperty("points");
  });

  it("nearby points should include distance", async () => {
    const { status, data } = await apiFetch("/spatial/nearby", {
      method: "POST",
      body: JSON.stringify({ latitude: -1.9403, longitude: 29.8739, radiusKm: 50 }),
    });
    expect(status).toBe(200);
    if (data.points.length > 0) {
      expect(data.points[0]).toHaveProperty("distanceKm");
      expect(typeof data.points[0].distanceKm).toBe("number");
    }
  });
});

// ══════════════════════════════════════════════════════════
//  AI ENDPOINTS
// ══════════════════════════════════════════════════════════

describe("Ask Rwanda", () => {
  it("should accept a question (preview mode)", async () => {
    const { status } = await apiFetch("/ask-rwanda", {
      method: "POST",
      body: JSON.stringify({
        query: "What is Umuganda?",
        mode: "standard",
        preview: true,
      }),
    });
    // 200 if AI service running, 503 if not
    expect([200, 503]).toContain(status);
  });

  it("should reject empty query", async () => {
    const { status } = await apiFetch("/ask-rwanda", {
      method: "POST",
      body: JSON.stringify({ query: "", mode: "standard" }),
    });
    expect([400, 422]).toContain(status);
  });
});
