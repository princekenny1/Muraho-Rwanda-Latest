/**
 * /api/analytics/track — Event Tracking Endpoint
 * /api/analytics/summary — Dashboard Summary (admin only)
 *
 * Receives lightweight tracking events from frontend.
 * Hashes IPs for privacy. Batches writes for performance.
 */

import type { PayloadHandler } from "payload";
import crypto from "crypto";

// ── IP Hashing (privacy-safe) ────────────────────────────────────────────────

function hashIP(ip: string): string {
  // Daily salt prevents long-term tracking
  const daySalt = new Date().toISOString().split("T")[0];
  return crypto.createHash("sha256").update(`${ip}:${daySalt}`).digest("hex").slice(0, 16);
}

// ── Device detection ─────────────────────────────────────────────────────────

function detectDevice(ua: string): "mobile" | "tablet" | "desktop" {
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

// ── Track Event ──────────────────────────────────────────────────────────────

export const trackEvent: PayloadHandler = async (req) => {
  try {
    const body = await req.json?.() || req.body;
    const {
      eventType,
      contentType,
      contentId,
      contentTitle,
      sessionId,
      durationSeconds,
      progressPercent,
      pagePath,
      referrer,
      metadata,
    } = body;

    if (!eventType) {
      return Response.json({ error: "eventType is required" }, { status: 400 });
    }

    const user = (req as any).user;
    const ip = req.headers?.get?.("x-forwarded-for")
      || req.headers?.get?.("x-real-ip")
      || "unknown";
    const ua = req.headers?.get?.("user-agent") || "";

    // Create event asynchronously (don't block response)
    req.payload.create({
      collection: "analytics-events",
      data: {
        eventType,
        contentType: contentType || undefined,
        contentId: contentId || undefined,
        contentTitle: contentTitle || undefined,
        user: user?.id || undefined,
        sessionId: sessionId || undefined,
        accessLevel: user
          ? (user.role === "admin" ? "agency" : "premium") // Simplified — in production check actual access
          : "free",
        durationSeconds: durationSeconds || undefined,
        progressPercent: progressPercent || undefined,
        pagePath: pagePath || undefined,
        referrer: referrer || undefined,
        deviceType: detectDevice(ua),
        ipHash: hashIP(ip as string),
        metadata: metadata || undefined,
      },
    }).catch((err: any) => {
      req.payload.logger.error(`Analytics track error: ${err.message}`);
    });

    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 });
  }
};

// ── Dashboard Summary (admin only) ───────────────────────────────────────────

export const analyticsSummary: PayloadHandler = async (req) => {
  const user = (req as any).user;
  if (!user || user.role !== "admin") {
    return Response.json({ error: "Admin only" }, { status: 403 });
  }

  try {
    const { days = "7" } = Object.fromEntries(new URL(req.url || "", "http://localhost").searchParams);
    const daysNum = parseInt(days as string) || 7;
    const since = new Date(Date.now() - daysNum * 86400000).toISOString();

    // Get event counts by type
    const [pageViews, contentPlays, contentCompletes, codeRedeems, aiQueries, totalEvents] =
      await Promise.all([
        req.payload.count({ collection: "analytics-events", where: { eventType: { equals: "page_view" }, createdAt: { greater_than: since } } }),
        req.payload.count({ collection: "analytics-events", where: { eventType: { equals: "content_play" }, createdAt: { greater_than: since } } }),
        req.payload.count({ collection: "analytics-events", where: { eventType: { equals: "content_complete" }, createdAt: { greater_than: since } } }),
        req.payload.count({ collection: "analytics-events", where: { eventType: { equals: "code_redeem" }, createdAt: { greater_than: since } } }),
        req.payload.count({ collection: "analytics-events", where: { eventType: { equals: "ai_query" }, createdAt: { greater_than: since } } }),
        req.payload.count({ collection: "analytics-events", where: { createdAt: { greater_than: since } } }),
      ]);

    // Get recent daily aggregates
    const dailyAggs = await req.payload.find({
      collection: "analytics-daily",
      sort: "-date",
      limit: daysNum,
    });

    // Active subscriptions
    const activeSubscriptions = await req.payload.count({
      collection: "subscriptions",
      where: { status: { in: ["active", "trial"] } },
    });

    // Total users
    const totalUsers = await req.payload.count({ collection: "users" });

    return Response.json({
      period: { days: daysNum, since },
      summary: {
        pageViews: pageViews.totalDocs,
        contentPlays: contentPlays.totalDocs,
        contentCompletes: contentCompletes.totalDocs,
        codeRedeems: codeRedeems.totalDocs,
        aiQueries: aiQueries.totalDocs,
        totalEvents: totalEvents.totalDocs,
        activeSubscriptions: activeSubscriptions.totalDocs,
        totalUsers: totalUsers.totalDocs,
      },
      daily: dailyAggs.docs,
    });
  } catch (err: any) {
    req.payload.logger.error(`Analytics summary error: ${err.message}`);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

// ── Agency-scoped analytics (for agency dashboards) ──────────────────────────

export const agencyAnalytics: PayloadHandler = async (req) => {
  const user = (req as any).user;
  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const { agencyId, days = "30" } = Object.fromEntries(
      new URL(req.url || "", "http://localhost").searchParams
    );

    // Verify agency access
    if (user.role !== "admin") {
      const agency = await req.payload.findByID({ collection: "tour-agencies", id: agencyId as string });
      const adminUserId = typeof (agency as any).adminUser === "object"
        ? (agency as any).adminUser.id
        : (agency as any).adminUser;
      if (adminUserId !== user.id) {
        return Response.json({ error: "Access denied" }, { status: 403 });
      }
    }

    const daysNum = parseInt(days as string) || 30;
    const since = new Date(Date.now() - daysNum * 86400000).toISOString();

    // Get agency codes
    const codesRes = await req.payload.find({
      collection: "access-codes",
      where: { agency: { equals: agencyId } },
      limit: 500,
    });

    const codes = codesRes.docs as any[];
    const totalIssued = codes.reduce((sum, c) => sum + (c.maxUses || 0), 0);
    const totalUsed = codes.reduce((sum, c) => sum + (c.usesCount || 0), 0);
    const activeCodes = codes.filter((c) => c.isActive).length;

    // Get code redemption events
    const redemptions = await req.payload.count({
      collection: "analytics-events",
      where: {
        and: [
          { eventType: { equals: "code_redeem" } },
          { createdAt: { greater_than: since } },
        ],
      },
    });

    return Response.json({
      period: { days: daysNum, since },
      codes: {
        total: codes.length,
        active: activeCodes,
        totalIssued,
        totalUsed,
        usageRate: totalIssued > 0 ? Math.round((totalUsed / totalIssued) * 100) : 0,
      },
      redemptions: redemptions.totalDocs,
    });
  } catch (err: any) {
    req.payload.logger.error(`Agency analytics error: ${err.message}`);
    return Response.json({ error: err.message }, { status: 500 });
  }
};
