/**
 * useAnalytics — Lightweight event tracking hook
 *
 * Auto-tracks: page views, content plays, session duration
 * Manual: trackEvent() for custom events
 *
 * Privacy: No PII in events. IP hashed server-side.
 * Performance: Fire-and-forget — never blocks UI.
 */

import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { api } from "@/lib/api/client";
import { useAuth } from "./useAuth";

// ── Session ID (persists for browser session) ────────────────────────────────

function getSessionId(): string {
  let sid = window.sessionStorage?.getItem?.("mrw_sid") || "";
  if (!sid) {
    sid = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    try {
      window.sessionStorage?.setItem?.("mrw_sid", sid);
    } catch {
      /* ok */
    }
  }
  return sid;
}

// ── Device detection ─────────────────────────────────────────────────────────

function getDeviceType(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  if (w < 640) return "mobile";
  if (w < 1024) return "tablet";
  return "desktop";
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAnalytics() {
  const location = useLocation();
  const { user } = useAuth();
  const sessionId = useRef(getSessionId());
  const lastPath = useRef("");

  // Auto-track page views on route change
  useEffect(() => {
    const path = location.pathname;
    if (path === lastPath.current) return; // Deduplicate
    lastPath.current = path;

    api.trackEvent({
      eventType: "page_view",
      metadata: {
        pagePath: path,
        deviceType: getDeviceType(),
        sessionId: sessionId.current,
        referrer: document.referrer || undefined,
      },
    });
  }, [location.pathname]);

  // Track content play
  const trackPlay = useCallback(
    (contentType: string, contentId: string, contentTitle?: string) => {
      api.trackEvent({
        eventType: "content_play",
        contentType,
        contentId,
        metadata: {
          contentTitle,
          sessionId: sessionId.current,
        },
      });
    },
    [],
  );

  // Track content complete
  const trackComplete = useCallback(
    (contentType: string, contentId: string, durationSeconds?: number) => {
      api.trackEvent({
        eventType: "content_complete",
        contentType,
        contentId,
        metadata: {
          durationSeconds,
          sessionId: sessionId.current,
        },
      });
    },
    [],
  );

  // Track search
  const trackSearch = useCallback((query: string, resultsCount?: number) => {
    api.trackEvent({
      eventType: "search",
      metadata: {
        query: query.slice(0, 100), // Truncate for privacy
        resultsCount,
        sessionId: sessionId.current,
      },
    });
  }, []);

  // Track share
  const trackShare = useCallback(
    (contentType: string, contentId: string, platform?: string) => {
      api.trackEvent({
        eventType: "share",
        contentType,
        contentId,
        metadata: { platform, sessionId: sessionId.current },
      });
    },
    [],
  );

  // Generic custom event
  const trackEvent = useCallback(
    (eventType: string, data?: Record<string, any>) => {
      api.trackEvent({
        eventType,
        ...data,
        metadata: {
          ...data?.metadata,
          sessionId: sessionId.current,
        },
      });
    },
    [],
  );

  return {
    trackPlay,
    trackComplete,
    trackSearch,
    trackShare,
    trackEvent,
    sessionId: sessionId.current,
  };
}

// ── Admin analytics data hook ─────────────────────────────────────────────────

import { useQuery } from "@tanstack/react-query";

export interface AnalyticsSummary {
  period: { days: number; since: string };
  summary: {
    pageViews: number;
    contentPlays: number;
    contentCompletes: number;
    codeRedeems: number;
    aiQueries: number;
    totalEvents: number;
    activeSubscriptions: number;
    totalUsers: number;
  };
  daily: any[];
}

export function useAdminAnalytics(days = 7) {
  return useQuery<AnalyticsSummary>({
    queryKey: ["admin-analytics", days],
    queryFn: async () => {
      const res = await fetch(`${api.baseURL}/analytics/summary?days=${days}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
