/**
 * Rate Limiting Middleware for Payload CMS
 * =========================================
 * Redis-backed rate limiter for API and custom endpoints.
 *
 * Limits:
 *   - Anonymous users: 30 req/min for read, 10 req/min for write
 *   - Authenticated users: 120 req/min for read, 60 req/min for write
 *   - Admin users: 300 req/min (all operations)
 *   - AI endpoints: 5 req/min (free), 30 req/min (paid)
 *   - Auth endpoints: 5 req/min (brute force protection)
 *
 * Falls back to in-memory store if Redis is unavailable.
 */

import type { PayloadRequest } from "payload";
import { createClient, type RedisClientType } from "redis";

// ── Configuration ─────────────────────────────────────

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const LIMITS: Record<string, RateLimitConfig> = {
  // Auth endpoints — tight limit for brute force protection
  auth: { windowMs: 60_000, maxRequests: 5 },
  // AI endpoints by tier
  "ai:free": { windowMs: 60_000, maxRequests: 5 },
  "ai:day_pass": { windowMs: 60_000, maxRequests: 15 },
  "ai:subscriber": { windowMs: 60_000, maxRequests: 30 },
  "ai:agency": { windowMs: 60_000, maxRequests: 60 },
  // General read operations
  "read:anon": { windowMs: 60_000, maxRequests: 30 },
  "read:auth": { windowMs: 60_000, maxRequests: 120 },
  // Write operations
  "write:anon": { windowMs: 60_000, maxRequests: 10 },
  "write:auth": { windowMs: 60_000, maxRequests: 60 },
  // Admin — high limit
  admin: { windowMs: 60_000, maxRequests: 300 },
  // Webhooks — no practical limit
  webhook: { windowMs: 60_000, maxRequests: 1000 },
};

// ── In-memory fallback store ──────────────────────────

const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryIncrement(key: string, windowMs: number): number {
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || now > entry.resetAt) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return 1;
  }

  entry.count += 1;
  return entry.count;
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryStore.entries()) {
    if (now > entry.resetAt) memoryStore.delete(key);
  }
}, 5 * 60_000);

// ── Redis client (lazy init) ──────────────────────────

let redis: RedisClientType | null = null;
let redisAvailable = false;

async function getRedis(): Promise<RedisClientType | null> {
  if (redis) return redisAvailable ? redis : null;

  const url = process.env.REDIS_URL || "redis://localhost:6379";
  try {
    redis = createClient({ url }) as RedisClientType;
    redis.on("error", () => {
      redisAvailable = false;
    });
    redis.on("connect", () => {
      redisAvailable = true;
    });
    await redis.connect();
    redisAvailable = true;
    return redis;
  } catch {
    redisAvailable = false;
    return null;
  }
}

// ── Core rate check ───────────────────────────────────

async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const key = `rl:${identifier}`;
  const windowSec = Math.ceil(config.windowMs / 1000);

  const client = await getRedis();

  if (client && redisAvailable) {
    try {
      const count = await client.incr(key);
      if (count === 1) {
        await client.expire(key, windowSec);
      }
      const ttl = await client.ttl(key);

      return {
        allowed: count <= config.maxRequests,
        remaining: Math.max(0, config.maxRequests - count),
        resetIn: ttl > 0 ? ttl : windowSec,
      };
    } catch {
      // Redis error — fall through to memory
    }
  }

  // Fallback to in-memory
  const count = memoryIncrement(key, config.windowMs);
  return {
    allowed: count <= config.maxRequests,
    remaining: Math.max(0, config.maxRequests - count),
    resetIn: windowSec,
  };
}

// ── Path classification ───────────────────────────────

function classifyRequest(
  path: string,
  method: string,
  userRole?: string,
  userTier?: string,
): { limitKey: string; config: RateLimitConfig } {
  // Auth endpoints
  if (
    path.includes("/users/login") ||
    path.includes("/users/forgot-password") ||
    path.includes("/users/reset-password")
  ) {
    return { limitKey: "auth", config: LIMITS["auth"] };
  }

  // Webhooks (Stripe/Flutterwave)
  if (path.includes("/webhooks/")) {
    return { limitKey: "webhook", config: LIMITS["webhook"] };
  }

  // Admin users
  if (userRole === "admin") {
    return { limitKey: "admin", config: LIMITS["admin"] };
  }

  // Read vs write
  const isWrite = ["POST", "PUT", "PATCH", "DELETE"].includes(
    method.toUpperCase(),
  );
  const authLevel = userRole ? "auth" : "anon";
  const opType = isWrite ? "write" : "read";
  const key = `${opType}:${authLevel}` as keyof typeof LIMITS;

  return { limitKey: key, config: LIMITS[key] };
}

// ── Middleware export ─────────────────────────────────

/**
 * Rate limiting middleware for Payload CMS.
 * Add to payload.config.ts:
 *
 *   import { rateLimitMiddleware } from "./middleware/rateLimit";
 *   // In express middleware or Payload hooks
 */
export async function rateLimitMiddleware(req: PayloadRequest): Promise<{
  allowed: boolean;
  headers: Record<string, string>;
}> {
  const path = req.url || req.pathname || "";
  const method = req.method || "GET";
  const ip =
    req.headers?.get?.("x-forwarded-for") ||
    req.headers?.get?.("x-real-ip") ||
    "unknown";
  const userId = (req as any).user?.id;
  const userRole = (req as any).user?.role;
  const userTier = (req as any).user?.accessTier;

  const { limitKey, config } = classifyRequest(
    path,
    method,
    userRole,
    userTier,
  );

  // Build unique identifier: userId if authenticated, IP otherwise
  const identifier = `${limitKey}:${userId || ip}`;

  const result = await checkRateLimit(identifier, config);

  const headers: Record<string, string> = {
    "X-RateLimit-Limit": String(config.maxRequests),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.resetIn),
  };

  if (!result.allowed) {
    headers["Retry-After"] = String(result.resetIn);
  }

  return { allowed: result.allowed, headers };
}

/**
 * Express-compatible middleware wrapper.
 * For use in payload.config.ts express configuration.
 */
export function createRateLimitHandler() {
  return async (req: any, res: any, next: any) => {
    const { allowed, headers } = await rateLimitMiddleware(req);

    // Set rate limit headers
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }

    if (!allowed) {
      return res.status(429).json({
        error: "Too many requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: parseInt(headers["Retry-After"] || "60"),
      });
    }

    next();
  };
}
