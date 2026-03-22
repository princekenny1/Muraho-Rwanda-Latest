/**
 * useAgency — Agency management hooks for Payload CMS
 *
 * Replaces: Legacy
 *   - tour_agencies → Payload collection "tour-agencies"
 *   - access_codes (agency-scoped) → Payload collection "access-codes" (filtered by agency)
 *
 * Backend collections:
 *   agencies: { name, slug, contactEmail, contactPhone, logoUrl, adminUser, isActive,
 *               accessLevel, verificationStatus, verifiedAt, country, region, licenseVerified }
 *   access-codes: { code, name, groupName, agency, maxUses, usesCount, validHours,
 *                   expiresAt, isActive }
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Agency {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  contact_phone: string | null;
  logo_url: string | null;
  admin_user_id: string | null;
  is_active: boolean;
  access_level: string;
  verification_status: string;
  verified_at: string | null;
  country: string | null;
  region: string | null;
  license_verified: boolean | null;
  created_at: string;
}

export interface AgencyCode {
  id: string;
  code: string;
  name: string | null;
  group_name: string | null;
  agency_id: string;
  max_uses: number;
  uses_count: number;
  valid_hours: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AgencyStats {
  totalCodesIssued: number;
  codesUsed: number;
  activeGroups: number;
  remainingBalance: number;
}

// ─── Payload ↔ Frontend mappers ───────────────────────────────────────────────

interface PayloadAgency {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  contactPhone?: string | null;
  logoUrl?: string | null;
  adminUser?: string | { id: string } | null;
  isActive: boolean;
  accessLevel: string;
  verificationStatus: string;
  verifiedAt?: string | null;
  country?: string | null;
  region?: string | null;
  licenseVerified?: boolean | null;
  createdAt: string;
}

interface PayloadAccessCode {
  id: string;
  code: string;
  name?: string | null;
  groupName?: string | null;
  agency: string | { id: string };
  maxUses: number;
  usesCount: number;
  validHours: number;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt: string;
}

function mapAgency(doc: PayloadAgency): Agency {
  const adminId =
    typeof doc.adminUser === "object" && doc.adminUser
      ? doc.adminUser.id
      : (doc.adminUser as string) ?? null;

  return {
    id: doc.id,
    name: doc.name,
    slug: doc.slug,
    contact_email: doc.contactEmail,
    contact_phone: doc.contactPhone ?? null,
    logo_url: doc.logoUrl ?? null,
    admin_user_id: adminId,
    is_active: doc.isActive,
    access_level: doc.accessLevel,
    verification_status: doc.verificationStatus,
    verified_at: doc.verifiedAt ?? null,
    country: doc.country ?? null,
    region: doc.region ?? null,
    license_verified: doc.licenseVerified ?? null,
    created_at: doc.createdAt,
  };
}

function mapCode(doc: PayloadAccessCode): AgencyCode {
  const agencyId =
    typeof doc.agency === "object" ? doc.agency.id : doc.agency;

  return {
    id: doc.id,
    code: doc.code,
    name: doc.name ?? null,
    group_name: doc.groupName ?? null,
    agency_id: agencyId,
    max_uses: doc.maxUses,
    uses_count: doc.usesCount,
    valid_hours: doc.validHours,
    expires_at: doc.expiresAt ?? null,
    is_active: doc.isActive,
    created_at: doc.createdAt,
  };
}

// ─── Agency list (admin) ──────────────────────────────────────────────────────

export function useAgencies() {
  return useQuery({
    queryKey: ["admin-agencies"],
    queryFn: async () => {
      const res = await api.find("tour-agencies", {
        sort: "-createdAt",
        limit: 200,
      });
      return (res.docs as PayloadAgency[]).map(mapAgency);
    },
  });
}

// ─── Single agency (agency portal) ───────────────────────────────────────────

export function useAgency(agencyId?: string) {
  return useQuery({
    queryKey: ["agency", agencyId],
    queryFn: async () => {
      const doc = await api.findById("tour-agencies", agencyId!);
      return mapAgency(doc as PayloadAgency);
    },
    enabled: !!agencyId,
  });
}

// ─── Agency mutations ─────────────────────────────────────────────────────────

export function useAgencyMutations() {
  const queryClient = useQueryClient();

  const verifyAgency = useMutation({
    mutationFn: async ({
      agencyId,
      status,
    }: {
      agencyId: string;
      status: "verified" | "rejected";
    }) => {
      return api.update("tour-agencies", agencyId, {
        verificationStatus: status,
        verifiedAt: status === "verified" ? new Date().toISOString() : null,
        isActive: status === "verified",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agencies"] });
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({
      agencyId,
      isActive,
    }: {
      agencyId: string;
      isActive: boolean;
    }) => {
      return api.update("tour-agencies", agencyId, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agencies"] });
    },
  });

  const updateAgency = useMutation({
    mutationFn: async ({
      agencyId,
      ...data
    }: {
      agencyId: string;
      name?: string;
      contactEmail?: string;
      contactPhone?: string;
      logoUrl?: string;
      country?: string;
      region?: string;
    }) => {
      return api.update("tour-agencies", agencyId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agencies"] });
      queryClient.invalidateQueries({ queryKey: ["agency"] });
    },
  });

  return { verifyAgency, toggleActive, updateAgency };
}

// ─── Agency codes (access codes scoped to an agency) ─────────────────────────

export function useAgencyCodes(agencyId?: string) {
  return useQuery({
    queryKey: ["agency-codes", agencyId],
    queryFn: async () => {
      const res = await api.find("access-codes", {
        where: { agency: { equals: agencyId } },
        sort: "-createdAt",
        limit: 200,
      });
      return (res.docs as PayloadAccessCode[]).map(mapCode);
    },
    enabled: !!agencyId,
  });
}

export function useAgencyCodeMutations() {
  const queryClient = useQueryClient();

  const createCode = useMutation({
    mutationFn: async (data: {
      code: string;
      name?: string;
      group_name?: string;
      agency_id: string;
      max_uses: number;
      valid_hours: number;
      expires_at?: string;
    }) => {
      return api.create("access-codes", {
        code: data.code,
        name: data.name,
        groupName: data.group_name,
        agency: data.agency_id,
        maxUses: data.max_uses,
        usesCount: 0,
        validHours: data.valid_hours,
        expiresAt: data.expires_at,
        isActive: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-codes"] });
    },
  });

  const updateCode = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      is_active?: boolean;
      max_uses?: number;
      expires_at?: string;
      group_name?: string;
    }) => {
      const payload: Record<string, unknown> = {};
      if (updates.is_active !== undefined) payload.isActive = updates.is_active;
      if (updates.max_uses !== undefined) payload.maxUses = updates.max_uses;
      if (updates.expires_at !== undefined) payload.expiresAt = updates.expires_at;
      if (updates.group_name !== undefined) payload.groupName = updates.group_name;
      return api.update("access-codes", id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-codes"] });
    },
  });

  const deleteCode = useMutation({
    mutationFn: async (id: string) => {
      return api.delete("access-codes", id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency-codes"] });
    },
  });

  return { createCode, updateCode, deleteCode };
}

// ─── Agency stats (computed from codes) ──────────────────────────────────────

export function useAgencyStats(agencyId?: string) {
  const { data: codes = [] } = useAgencyCodes(agencyId);

  const stats: AgencyStats = {
    totalCodesIssued: codes.reduce((sum, c) => sum + c.max_uses, 0),
    codesUsed: codes.reduce((sum, c) => sum + c.uses_count, 0),
    activeGroups: codes.filter(
      (c) =>
        c.is_active &&
        (!c.expires_at || new Date(c.expires_at) > new Date())
    ).length,
    remainingBalance: codes.reduce(
      (sum, c) => sum + Math.max(0, c.max_uses - c.uses_count),
      0
    ),
  };

  return stats;
}

// ─── Logo upload helper ──────────────────────────────────────────────────────

export async function uploadAgencyLogo(file: File): Promise<string> {
  const doc = await api.uploadMedia(file);
  // Payload returns the media doc with url field
  return (doc as { url: string }).url;
}

// ── Cryptographic code generator ─────────────────────────────────────────────

function generateSecureCode(format: "short" | "long" | "custom" = "short", prefix?: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/O/0/1 — avoids confusion
  const arr = new Uint8Array(format === "long" ? 12 : 8);
  crypto.getRandomValues(arr);
  const raw = Array.from(arr, (b) => chars[b % chars.length]).join("");

  if (format === "long") {
    // Format: PREFIX-XXXX-XXXX-XXXX
    const p = prefix || "MRW";
    return `${p}-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
  }
  // Format: PREFIX-XXXXXXXX
  return `${prefix || "MRW"}-${raw}`;
}

// ── Agency purchases ────────────────────────────────────────────────────────

interface PayloadPurchase {
  id: string;
  agency: string | { id: string };
  plan: string | { id: string; name: string };
  quantity: number;
  totalPriceCents: number;
  codesAllocated: number;
  codesRemaining: number;
  purchasedAt: string;
  expiresAt?: string | null;
  status: string;
  createdAt: string;
}

export interface AgencyPurchase {
  id: string;
  agency_id: string;
  plan_name: string;
  quantity: number;
  total_price_cents: number;
  codes_allocated: number;
  codes_remaining: number;
  purchased_at: string;
  expires_at: string | null;
  status: string;
}

function mapPurchase(doc: PayloadPurchase): AgencyPurchase {
  return {
    id: doc.id,
    agency_id: typeof doc.agency === "object" ? doc.agency.id : doc.agency,
    plan_name: typeof doc.plan === "object" ? doc.plan.name : String(doc.plan),
    quantity: doc.quantity,
    total_price_cents: doc.totalPriceCents,
    codes_allocated: doc.codesAllocated,
    codes_remaining: doc.codesRemaining,
    purchased_at: doc.purchasedAt,
    expires_at: doc.expiresAt ?? null,
    status: doc.status,
  };
}

export function useAgencyPurchases(agencyId?: string) {
  return useQuery({
    queryKey: ["agency-purchases", agencyId],
    queryFn: async () => {
      const res = await api.find("agency-purchases", {
        where: { agency: { equals: agencyId } },
        sort: "-purchasedAt",
        limit: 100,
      });
      return (res.docs as PayloadPurchase[]).map(mapPurchase);
    },
    enabled: !!agencyId,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// UNIFIED useAgencyPortal() — the hook agency pages expect
// ══════════════════════════════════════════════════════════════════════════════
// Returns: { agency, loading, stats, codes, purchases, generateCode, deactivateCode }

import { useState, useEffect, useCallback } from "react";

export function useAgencyPortal() {
  const queryClient = useQueryClient();

  // Get current user's agency ID from auth
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [agencyLoading, setAgencyLoading] = useState(true);

  useEffect(() => {
    const fetchMyAgency = async () => {
      try {
        const me = await api.me();
        const user = me?.user || me;
        const aid = typeof user?.agency === "object" ? user.agency?.id : user?.agency;
        setAgencyId(aid || null);
      } catch {
        setAgencyId(null);
      }
      setAgencyLoading(false);
    };
    fetchMyAgency();
  }, []);

  const { data: agency, isLoading: agencyQueryLoading } = useAgency(agencyId || undefined);
  const { data: codes = [], isLoading: codesLoading } = useAgencyCodes(agencyId || undefined);
  const { data: purchases = [] } = useAgencyPurchases(agencyId || undefined);
  const stats = useAgencyStats(agencyId || undefined);
  const { createCode, updateCode } = useAgencyCodeMutations();

  const loading = agencyLoading || agencyQueryLoading || codesLoading;

  // Generate one or more access codes
  const generateCode = useCallback(
    async (params: {
      groupName?: string;
      count?: number;
      maxUses: number;
      validHours: number;
      expiresAt?: string;
      codeFormat?: "short" | "long";
      prefix?: string;
    }) => {
      if (!agencyId) throw new Error("No agency found for current user");

      const count = params.count || 1;
      const results: AgencyCode[] = [];

      for (let i = 0; i < count; i++) {
        const code = generateSecureCode(params.codeFormat || "short", params.prefix);
        const doc = await createCode.mutateAsync({
          code,
          group_name: params.groupName,
          agency_id: agencyId,
          max_uses: params.maxUses,
          valid_hours: params.validHours,
          expires_at: params.expiresAt,
        });
        results.push(mapCode(doc as PayloadAccessCode));
      }

      queryClient.invalidateQueries({ queryKey: ["agency-codes"] });
      return results;
    },
    [agencyId, createCode, queryClient]
  );

  // Deactivate a code
  const deactivateCode = useCallback(
    async (codeId: string) => {
      await updateCode.mutateAsync({ id: codeId, is_active: false });
    },
    [updateCode]
  );

  return {
    agency: agency || null,
    loading,
    stats,
    codes,
    purchases,
    generateCode,
    deactivateCode,
    agencyId,
  };
}

// ── Agency pricing plans ─────────────────────────────────────────────────────

export interface AgencyPricingPlan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_cents: number;
  plan_type: "per_person" | "group_package" | "unlimited";
  included_codes: number | null;
  validity_days: number;
  is_active: boolean;
}

export function useAgencyPricingPlans() {
  const { data: plans = [], isLoading: loading } = useQuery({
    queryKey: ["agency-pricing-plans"],
    queryFn: async () => {
      const res = await api.find("agency-pricing-plans", {
        where: { isActive: { equals: true } },
        sort: "priceCents",
        limit: 20,
      });
      return (res.docs as any[]).map((doc): AgencyPricingPlan => ({
        id: doc.id,
        name: doc.name,
        slug: doc.slug,
        description: doc.description ?? null,
        price_cents: doc.priceCents,
        plan_type: doc.planType,
        included_codes: doc.includedCodes ?? null,
        validity_days: doc.validityDays,
        is_active: doc.isActive,
      }));
    },
  });

  return { plans, loading };
}
