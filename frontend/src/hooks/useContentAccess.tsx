/**
 * useContentAccess — Content access control with React context
 *
 * Replaces: Legacy
 *   code_redemptions, user_roles, sponsors
 * Payload: user-content-access, content-access, access-codes, code-redemptions, users
 */

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";
import { api } from "@/lib/api/client";
import { useAuth } from "./useAuth";

export type ContentTier = "free" | "premium" | "sponsored";
export type AccessType = "subscription" | "purchase" | "tour_code" | "sponsored" | "admin_grant";
export type UserAccessLevel = "free" | "premium" | "tour_code" | "agency_admin";

export interface ContentAccessConfig {
  id: string;
  content_type: string;
  content_id: string;
  tier: ContentTier;
  price_cents: number | null;
  sponsor_id: string | null;
  sponsor_message: string | null;
  teaser_duration_seconds: number;
  sponsor?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  } | null;
}

export interface UserAccess {
  id: string;
  access_type: AccessType;
  content_type: string | null;
  content_id: string | null;
  expires_at: string | null;
  agency_code_id: string | null;
}

export interface TourGroupAccess {
  agencyName: string;
  accessLevel: string;
  expiresAt: Date;
  codeId: string;
}

interface ContentAccessContextValue {
  userAccess: UserAccess[];
  tourGroupAccess: TourGroupAccess | null;
  hasSubscription: boolean;
  accessLevel: UserAccessLevel;
  loading: boolean;
  checkAccess: (contentType: string, contentId: string) => Promise<AccessCheckResult>;
  redeemCode: (code: string) => Promise<{ success: boolean; error?: string; access?: TourGroupAccess }>;
  refreshAccess: () => Promise<void>;
}

export interface AccessCheckResult {
  hasAccess: boolean;
  accessType: AccessType | null;
  tier: ContentTier;
  config: ContentAccessConfig | null;
  reason: "free" | "sponsored" | "subscription" | "purchased" | "tour_code" | "admin" | "locked";
}

const ContentAccessContext = createContext<ContentAccessContextValue | null>(null);

// ─── Field mappers ────────────────────────────────────────────────────────────

function mapUserAccess(doc: Record<string, any>): UserAccess {
  // Payload returns relationship as agencyCode (ID or populated object)
  const agencyCodeId = typeof doc.agencyCode === "object" ? doc.agencyCode?.id : doc.agencyCode ?? doc.agencyCodeId;
  return {
    id: doc.id,
    access_type: doc.accessType,
    content_type: doc.contentType ?? null,
    content_id: doc.contentId ?? null,
    expires_at: doc.expiresAt ?? null,
    agency_code_id: agencyCodeId ?? null,
  };
}

function mapConfig(doc: Record<string, any>): ContentAccessConfig {
  return {
    id: doc.id,
    content_type: doc.contentType,
    content_id: doc.contentId,
    tier: doc.tier,
    price_cents: doc.priceCents ?? null,
    sponsor_id: typeof doc.sponsor === "object" ? doc.sponsor?.id : doc.sponsor ?? null,
    sponsor_message: doc.sponsorMessage ?? null,
    teaser_duration_seconds: doc.teaserDurationSeconds ?? 30,
    sponsor: doc.sponsor && typeof doc.sponsor === "object"
      ? {
          id: doc.sponsor.id,
          name: doc.sponsor.name,
          slug: doc.sponsor.slug,
          logo_url: doc.sponsor.logoUrl ?? null,
        }
      : null,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ContentAccessProvider({ children }: { children: ReactNode }) {
  const { user, roles } = useAuth();
  const [userAccess, setUserAccess] = useState<UserAccess[]>([]);
  const [tourGroupAccess, setTourGroupAccess] = useState<TourGroupAccess | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserAccess = useCallback(async () => {
    if (!user) {
      setUserAccess([]);
      setTourGroupAccess(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.find("user-content-access", {
        where: {
          and: [
            { user: { equals: user.id } },
            {
              or: [
                { expiresAt: { exists: false } },
                { expiresAt: { greater_than: new Date().toISOString() } },
              ],
            },
          ],
        },
        limit: 200,
      });

      const accessDocs = (res.docs as Record<string, any>[]).map(mapUserAccess);
      setUserAccess(accessDocs);

      // Check for active tour group access
      const tourAccessDoc = accessDocs.find(
        (a) => a.access_type === "tour_code" && a.agency_code_id
      );

      if (tourAccessDoc?.agency_code_id) {
        try {
          const codeDoc = await api.findById("access-codes", tourAccessDoc.agency_code_id, { depth: 1 });
          const cd = codeDoc as Record<string, any>;
          const agencyName = typeof cd.agency === "object" ? cd.agency?.name : "Tour Group";
          setTourGroupAccess({
            agencyName,
            accessLevel: cd.accessLevel ?? "full",
            expiresAt: new Date(tourAccessDoc.expires_at || ""),
            codeId: cd.id,
          });
        } catch {
          setTourGroupAccess(null);
        }
      } else {
        setTourGroupAccess(null);
      }
    } catch (err) {
      console.error("Error fetching user access:", err);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchUserAccess();
  }, [fetchUserAccess]);

  const hasSubscription = userAccess.some(
    (a) =>
      a.access_type === "subscription" &&
      (!a.expires_at || new Date(a.expires_at) > new Date())
  );

  const accessLevel: UserAccessLevel = hasSubscription
    ? "premium"
    : tourGroupAccess
    ? "tour_code"
    : "free";

  // ─── checkAccess ──────────────────────────────────────────────────────

  const checkAccess = useCallback(
    async (contentType: string, contentId: string): Promise<AccessCheckResult> => {
      // Fetch content access config
      let config: ContentAccessConfig | null = null;
      try {
        const res = await api.find("content-access", {
          where: {
            and: [
              { contentType: { equals: contentType } },
              { contentId: { equals: contentId } },
            ],
          },
          depth: 1,
          limit: 1,
        });
        if (res.docs.length > 0) {
          config = mapConfig(res.docs[0] as Record<string, any>);
        }
      } catch {
        // no config found
      }

      // Default to free if no config
      if (!config) {
        return { hasAccess: true, accessType: null, tier: "free", config: null, reason: "free" };
      }

      // Free content
      if (config.tier === "free") {
        return { hasAccess: true, accessType: null, tier: "free", config, reason: "free" };
      }

      // Sponsored content
      if (config.tier === "sponsored" && config.sponsor_id) {
        return { hasAccess: true, accessType: "sponsored", tier: "sponsored", config, reason: "sponsored" };
      }

      // Check user access if logged in
      if (user) {
        // Admin always has access (roles come from useAuth)
        if (roles.includes("admin")) {
          return { hasAccess: true, accessType: "admin_grant", tier: config.tier, config, reason: "admin" };
        }

        // Subscription
        if (hasSubscription) {
          return { hasAccess: true, accessType: "subscription", tier: config.tier, config, reason: "subscription" };
        }

        // Tour group access
        if (tourGroupAccess) {
          const levelMatches =
            tourGroupAccess.accessLevel === "full" ||
            (tourGroupAccess.accessLevel === "stories_only" &&
              ["documentary", "testimony"].includes(contentType)) ||
            (tourGroupAccess.accessLevel === "museums_only" &&
              ["exhibition", "vr_scene", "location"].includes(contentType));

          if (levelMatches) {
            return { hasAccess: true, accessType: "tour_code", tier: config.tier, config, reason: "tour_code" };
          }
        }

        // Individual purchase
        const hasPurchased = userAccess.some(
          (a) =>
            a.access_type === "purchase" &&
            a.content_type === contentType &&
            a.content_id === contentId
        );

        if (hasPurchased) {
          return { hasAccess: true, accessType: "purchase", tier: config.tier, config, reason: "purchased" };
        }
      }

      // No access
      return { hasAccess: false, accessType: null, tier: config.tier, config, reason: "locked" };
    },
    [user, roles, userAccess, hasSubscription, tourGroupAccess]
  );

  // ─── redeemCode ───────────────────────────────────────────────────────

  const redeemCode = useCallback(
    async (code: string): Promise<{ success: boolean; error?: string; access?: TourGroupAccess }> => {
      if (!user) {
        return { success: false, error: "Please sign in to redeem a code" };
      }

      try {
        // Use the dedicated API endpoint (handles validation, redemption, incrementing)
        const result = await api.redeemCode(code);

        if (!result.success) {
          return { success: false, error: result.error || "Failed to redeem code" };
        }

        // Refresh access after successful redemption
        await fetchUserAccess();

        if (tourGroupAccess) {
          return { success: true, access: tourGroupAccess };
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Failed to redeem code" };
      }
    },
    [user, fetchUserAccess, tourGroupAccess]
  );

  return (
    <ContentAccessContext.Provider
      value={{
        userAccess,
        tourGroupAccess,
        hasSubscription,
        accessLevel,
        loading,
        checkAccess,
        redeemCode,
        refreshAccess: fetchUserAccess,
      }}
    >
      {children}
    </ContentAccessContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useContentAccess() {
  const context = useContext(ContentAccessContext);
  if (!context) {
    throw new Error("useContentAccess must be used within ContentAccessProvider");
  }
  return context;
}

// ─── Helper hook for checking specific content ────────────────────────────────

export function useContentAccessCheck(contentType: string, contentId: string) {
  const { checkAccess } = useContentAccess();
  const [result, setResult] = useState<AccessCheckResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      setLoading(true);
      const accessResult = await checkAccess(contentType, contentId);
      if (mounted) {
        setResult(accessResult);
        setLoading(false);
      }
    };

    check();

    return () => {
      mounted = false;
    };
  }, [contentType, contentId, checkAccess]);

  return { result, loading };
}
