/**
 * Muraho Rwanda — Security Middleware
 * =====================================
 * Comprehensive security hardening for production:
 *
 * 1. Input sanitization — strips XSS vectors from string fields
 * 2. Error message filtering — never leaks stack traces or DB details
 * 3. Security headers — defense-in-depth beyond Nginx
 * 4. Request ID injection — for audit trail correlation
 * 5. Suspicious activity detection — logs anomalies
 */

import crypto from "crypto";

// ══════════════════════════════════════════════════════════════════════════════
// 1. INPUT SANITIZATION
// ══════════════════════════════════════════════════════════════════════════════

// Strip dangerous HTML/script patterns from string values
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,     // Event handlers: onclick="..."
  /javascript\s*:/gi,                    // javascript: URLs
  /data\s*:\s*text\/html/gi,            // data: HTML payloads
  /vbscript\s*:/gi,
  /<iframe\b[^>]*>/gi,
  /<embed\b[^>]*>/gi,
  /<object\b[^>]*>/gi,
  /expression\s*\(/gi,                  // CSS expression()
];

function sanitizeString(value: string): string {
  let clean = value;
  for (const pattern of XSS_PATTERNS) {
    clean = clean.replace(pattern, "");
  }
  // Normalize unicode tricks
  clean = clean.normalize("NFKC");
  return clean;
}

function sanitizeValue(value: unknown): unknown {
  if (typeof value === "string") {
    return sanitizeString(value);
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value && typeof value === "object") {
    return sanitizeObject(value as Record<string, unknown>);
  }
  return value;
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip internal Payload fields
    if (key.startsWith("_")) {
      clean[key] = value;
      continue;
    }
    clean[sanitizeString(key)] = sanitizeValue(value);
  }
  return clean;
}

/**
 * Express middleware: sanitize all incoming request bodies.
 */
export function inputSanitizer(req: any, _res: any, next: () => void): void {
  if (req.body && typeof req.body === "object") {
    req.body = sanitizeObject(req.body);
  }
  // Sanitize query params
  if (req.query && typeof req.query === "object") {
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === "string") {
        req.query[key] = sanitizeString(value);
      }
    }
  }
  next();
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. ERROR MESSAGE FILTERING
// ══════════════════════════════════════════════════════════════════════════════

// Patterns that indicate internal details we should never expose
const INTERNAL_ERROR_PATTERNS = [
  /postgres/i, /postgresql/i, /pg_/i,
  /relation ".*" does not exist/i,
  /column ".*" of relation/i,
  /duplicate key value/i,
  /syntax error at/i,
  /ECONNREFUSED/i, /ENOTFOUND/i,
  /at\s+\S+\s+\(\S+:\d+:\d+\)/,       // Stack trace lines
  /node_modules/i,
  /secret|password|token|key/i,
];

function sanitizeErrorMessage(message: string): string {
  for (const pattern of INTERNAL_ERROR_PATTERNS) {
    if (pattern.test(message)) {
      return "An internal error occurred. Please try again later.";
    }
  }
  return message;
}

/**
 * Express error handler: catch all errors and sanitize before sending.
 */
export function errorSanitizer(err: any, _req: any, res: any, next: () => void): void {
  if (res.headersSent) {
    return next();
  }

  const statusCode = err.status || err.statusCode || 500;

  // Log full error internally
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "error",
    type: "unhandled_error",
    message: err.message,
    stack: err.stack?.split("\n").slice(0, 5),
    statusCode,
  }));

  // Send sanitized response
  res.status(statusCode).json({
    error: statusCode >= 500
      ? sanitizeErrorMessage(err.message)
      : err.message || "Request failed",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. SECURITY HEADERS (defense-in-depth — Nginx also sets these)
// ══════════════════════════════════════════════════════════════════════════════

export function securityHeaders(req: any, res: any, next: () => void): void {
  // Request ID for correlation
  const requestId = crypto.randomUUID().slice(0, 12);
  res.setHeader("X-Request-Id", requestId);
  req._requestId = requestId;

  // Security headers (reinforces Nginx config)
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "0"); // Modern CSP preferred
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(self), geolocation=(self)");

  // Content Security Policy — defense against XSS, clickjacking, data injection
  const appUrl = process.env.APP_URL || "https://muraho.rw";
  const s3Url = process.env.S3_ENDPOINT || "https://s3.muraho.rw";
  const csp = [
    `default-src 'self'`,
    `script-src 'self' https://js.stripe.com https://checkout.flutterwave.com`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com`,
    `img-src 'self' data: blob: ${s3Url} https://*.tile.openstreetmap.org https://api.mapbox.com`,
    `media-src 'self' blob: ${s3Url}`,
    `connect-src 'self' ${appUrl} ${s3Url} https://api.stripe.com https://api.flutterwave.com wss:`,
    `frame-src https://js.stripe.com https://checkout.flutterwave.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self' https://checkout.stripe.com https://checkout.flutterwave.com`,
    `object-src 'none'`,
  ].join("; ");
  res.setHeader("Content-Security-Policy", csp);

  // Strict Transport Security (enforce HTTPS)
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }

  // Prevent caching of API responses with auth data
  if (req.url?.includes("/api/users") || req.url?.includes("/api/payments")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.setHeader("Pragma", "no-cache");
  }

  next();
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. SUSPICIOUS ACTIVITY DETECTION
// ══════════════════════════════════════════════════════════════════════════════

// Track failed auth attempts per IP
const failedAttempts = new Map<string, { count: number; firstAt: number }>();

export function suspiciousActivityDetector(req: any, res: any, next: () => void): void {
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  const path = req.url || "";

  // Check for path traversal attempts
  if (path.includes("..") || path.includes("%2e%2e") || path.includes("%252e")) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "warn",
      type: "suspicious_activity",
      category: "path_traversal",
      ip,
      path,
    }));
    return res.status(400).json({ error: "Bad request" });
  }

  // Check for SQL injection patterns in query params
  const queryString = JSON.stringify(req.query || {});
  if (/(\bunion\b.*\bselect\b|\bdrop\b.*\btable\b|--|;.*\bexec\b)/i.test(queryString)) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "warn",
      type: "suspicious_activity",
      category: "sql_injection_attempt",
      ip,
      path,
    }));
    return res.status(400).json({ error: "Bad request" });
  }

  // Track failed login attempts
  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    if (path.includes("/users/login") && res.statusCode === 401) {
      const entry = failedAttempts.get(ip) || { count: 0, firstAt: Date.now() };
      entry.count += 1;

      // Reset after 15 minutes
      if (Date.now() - entry.firstAt > 15 * 60000) {
        entry.count = 1;
        entry.firstAt = Date.now();
      }

      failedAttempts.set(ip, entry);

      if (entry.count >= 10) {
        console.error(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: "warn",
          type: "suspicious_activity",
          category: "brute_force",
          ip,
          attempts: entry.count,
        }));
      }
    }

    originalEnd.apply(res, args);
  };

  next();
}

// Cleanup old entries every 30 minutes
setInterval(() => {
  const cutoff = Date.now() - 30 * 60000;
  for (const [ip, entry] of failedAttempts.entries()) {
    if (entry.firstAt < cutoff) failedAttempts.delete(ip);
  }
}, 30 * 60000);

// ══════════════════════════════════════════════════════════════════════════════
// 5. COMBINED SECURITY MIDDLEWARE STACK
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Apply all security middleware in correct order.
 * Usage in server.ts or Payload express config:
 *
 *   import { applySecurityMiddleware } from "./middleware/security";
 *   applySecurityMiddleware(app);
 */
export function applySecurityMiddleware(app: any): void {
  app.use(securityHeaders);
  app.use(suspiciousActivityDetector);
  app.use(inputSanitizer);
  // Error handler must be last
  app.use(errorSanitizer);
}
