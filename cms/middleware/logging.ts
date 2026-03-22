/**
 * Muraho Rwanda — Structured Logging Middleware
 * ==============================================
 * JSON-formatted request/response logging for production observability.
 *
 * Logs: method, path, status, duration, userId, IP, userAgent, errors
 *
 * Usage in Payload config:
 *   import { requestLogger, auditLogger } from "./middleware/logging";
 *   // Express middleware
 *   app.use(requestLogger);
 *   // Audit log for mutations
 *   hooks: { afterChange: [auditLogger] }
 */

import type { PayloadHandler, PayloadRequest } from "payload";

// ── Log levels ───────────────────────────────────────

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const CURRENT_LOG_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) || "info";

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_ORDER[level] >= LOG_LEVEL_ORDER[CURRENT_LOG_LEVEL];
}

// ── Structured log writer ────────────────────────────

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  type: string;
  message: string;
  [key: string]: any;
}

function writeLog(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return;

  const output = JSON.stringify({
    ...entry,
    service: "muraho-cms",
    env: process.env.NODE_ENV || "development",
  });

  if (entry.level === "error") {
    console.error(output);
  } else if (entry.level === "warn") {
    console.warn(output);
  } else {
    console.log(output);
  }
}

// ── Request logger (Express middleware) ───────────────

export function requestLogger(req: any, res: any, next: () => void): void {
  const start = Date.now();
  const requestId = crypto.randomUUID().slice(0, 8);

  // Attach requestId for downstream use
  req._requestId = requestId;

  // Hook into response finish
  const originalEnd = res.end;
  res.end = function (...args: any[]) {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const userId = (req as any).user?.id || null;

    // Determine log level from status
    let level: LogLevel = "info";
    if (status >= 500) level = "error";
    else if (status >= 400) level = "warn";
    else if (duration > 5000) level = "warn";

    // Skip noisy health checks at info level
    const path = req.originalUrl || req.url;
    if (path === "/api/health" && status === 200) {
      level = "debug";
    }

    writeLog({
      timestamp: new Date().toISOString(),
      level,
      type: "request",
      message: `${req.method} ${path} ${status} ${duration}ms`,
      requestId,
      method: req.method,
      path,
      status,
      durationMs: duration,
      userId,
      ip: req.headers["x-forwarded-for"] || req.socket?.remoteAddress,
      userAgent: req.headers["user-agent"]?.slice(0, 200),
      contentLength: res.getHeader("content-length") || 0,
      ...(status >= 400 && { query: req.query }),
    });

    originalEnd.apply(res, args);
  };

  next();
}

// ── Audit logger (Payload collection hook) ───────────

interface AuditLogParams {
  collection: string;
  operation: "create" | "update" | "delete";
  doc: any;
  previousDoc?: any;
  req: PayloadRequest;
}

export function createAuditHook(collection: string) {
  return {
    afterChange: async ({
      doc,
      previousDoc,
      operation,
      req,
    }: {
      doc: any;
      previousDoc?: any;
      operation: "create" | "update";
      req: PayloadRequest;
    }) => {
      auditLog({
        collection,
        operation,
        doc,
        previousDoc,
        req,
      });
      return doc;
    },
    afterDelete: async ({
      doc,
      req,
    }: {
      doc: any;
      req: PayloadRequest;
    }) => {
      auditLog({
        collection,
        operation: "delete",
        doc,
        req,
      });
      return doc;
    },
  };
}

function auditLog({ collection, operation, doc, previousDoc, req }: AuditLogParams): void {
  const user = (req as any).user;

  // Compute changed fields for updates
  let changedFields: string[] | undefined;
  if (operation === "update" && previousDoc) {
    changedFields = Object.keys(doc).filter((key) => {
      if (["updatedAt", "createdAt", "_status"].includes(key)) return false;
      return JSON.stringify(doc[key]) !== JSON.stringify(previousDoc?.[key]);
    });
  }

  writeLog({
    timestamp: new Date().toISOString(),
    level: "info",
    type: "audit",
    message: `${operation} ${collection}/${doc.id}`,
    collection,
    operation,
    documentId: doc.id,
    documentTitle: doc.title || doc.name || doc.email || doc.id,
    userId: user?.id || null,
    userEmail: user?.email || null,
    userRole: user?.role || null,
    ip: req.headers?.get("x-forwarded-for") || undefined,
    ...(changedFields && { changedFields }),
    ...(operation === "delete" && { deletedTitle: doc.title || doc.name }),
  });
}

// ── Error logger ─────────────────────────────────────

export function logError(error: Error, context?: Record<string, any>): void {
  writeLog({
    timestamp: new Date().toISOString(),
    level: "error",
    type: "error",
    message: error.message,
    stack: error.stack?.split("\n").slice(0, 5).join("\n"),
    errorName: error.name,
    ...context,
  });
}

// ── Performance logger ───────────────────────────────

export function logPerformance(
  operation: string,
  durationMs: number,
  metadata?: Record<string, any>
): void {
  const level: LogLevel = durationMs > 5000 ? "warn" : durationMs > 1000 ? "info" : "debug";

  writeLog({
    timestamp: new Date().toISOString(),
    level,
    type: "performance",
    message: `${operation} completed in ${durationMs}ms`,
    operation,
    durationMs,
    ...metadata,
  });
}

// ── Startup logger ───────────────────────────────────

export function logStartup(config: Record<string, any>): void {
  writeLog({
    timestamp: new Date().toISOString(),
    level: "info",
    type: "startup",
    message: "Muraho Rwanda CMS starting",
    nodeVersion: process.version,
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT || 3000,
    ...config,
  });
}
