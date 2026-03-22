import type { CollectionConfig } from "payload";
import { publicReadAdminWrite, isAdmin, isOwnerOrAdmin, ownerAccess, publicRead } from "../access";
import { autoSlug } from "../hooks";

// ── SPONSORS (maps: public.sponsors) ─────────────────────
export const Sponsors: CollectionConfig = {
  slug: "sponsors",
  admin: { useAsTitle: "name", defaultColumns: ["name", "slug", "isActive"], group: "Access" },
  access: publicReadAdminWrite,
  hooks: { beforeValidate: [autoSlug] },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "logoUrl", type: "text" },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "description", type: "textarea" },
    { name: "websiteUrl", type: "text" },
    { name: "isActive", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
  ],
};

// ── CONTENT ACCESS (maps: public.content_access) ─────────
export const ContentAccess: CollectionConfig = {
  slug: "content-access",
  admin: { useAsTitle: "contentType", defaultColumns: ["contentType", "contentId", "tier", "sponsor"], group: "Access" },
  access: publicReadAdminWrite,
  fields: [
    { name: "contentType", type: "select", required: true, options: [
      { label: "Documentary", value: "documentary" },
      { label: "Testimony", value: "testimony" },
      { label: "Exhibition", value: "exhibition" },
      { label: "Location", value: "location" },
      { label: "VR Scene", value: "vr_scene" },
      { label: "Story", value: "story" },
      { label: "Route", value: "route" },
    ]},
    { name: "contentId", type: "text", required: true, index: true },
    { name: "tier", type: "select", required: true, defaultValue: "free", options: [
      { label: "Free", value: "free" },
      { label: "Premium", value: "premium" },
      { label: "Sponsored", value: "sponsored" },
    ]},
    { name: "priceCents", type: "number", admin: { description: "Individual purchase price in cents" } },
    { name: "sponsor", type: "relationship", relationTo: "sponsors" },
    { name: "sponsorMessage", type: "textarea" },
    { name: "teaserDurationSeconds", type: "number", defaultValue: 20 },
  ],
};

// ── TOUR AGENCIES (maps: public.tour_agencies) ───────────
// SLUG FIX: was "agencies", now "tour-agencies" to match frontend
export const TourAgencies: CollectionConfig = {
  slug: "tour-agencies",
  admin: { useAsTitle: "name", defaultColumns: ["name", "contactEmail", "verificationStatus", "isActive"], group: "Access" },
  access: {
    read: publicRead,
    create: ({ req: { user } }) => !!user,
    update: ({ req: { user } }) => {
      if (user?.role === "admin") return true;
      if (user) return { adminUser: { equals: user.id } };
      return false;
    },
    delete: isAdmin,
  },
  hooks: { beforeValidate: [autoSlug] },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true },
    { name: "contactEmail", type: "email", required: true },
    { name: "contactPhone", type: "text" },
    { name: "logoUrl", type: "text" },
    { name: "logo", type: "upload", relationTo: "media" },
    { name: "adminUser", type: "relationship", relationTo: "users" },
    { name: "isActive", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
    { name: "accessLevel", type: "select", defaultValue: "full", options: [
      { label: "Full", value: "full" },
      { label: "Museums Only", value: "museums_only" },
      { label: "Stories Only", value: "stories_only" },
    ]},
    { name: "verificationStatus", type: "select", defaultValue: "pending", options: [
      { label: "Pending", value: "pending" },
      { label: "Verified", value: "verified" },
      { label: "Rejected", value: "rejected" },
    ], admin: { position: "sidebar" }},
    { name: "verifiedAt", type: "date" },
    { name: "country", type: "text" },
    { name: "region", type: "text" },
    { name: "licenseVerified", type: "checkbox", defaultValue: false },
  ],
};

// ── AGENCY ACCESS CODES (maps: public.agency_access_codes) ─
export const AgencyAccessCodes: CollectionConfig = {
  slug: "access-codes",
  admin: { useAsTitle: "code", defaultColumns: ["code", "agency", "usesCount", "maxUses", "isActive"], group: "Access" },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === "admin") return true;
      if (user?.role === "agency_admin" && user?.id)
        return { agency: { adminUser: { equals: String(user.id) } } } as any;
      return false;
    },
    create: ({ req: { user } }) => user?.role === "admin" || user?.role === "agency_admin",
    update: ({ req: { user } }) => user?.role === "admin" || user?.role === "agency_admin",
    delete: isAdmin,
  },
  fields: [
    { name: "agency", type: "relationship", relationTo: "tour-agencies", required: true, index: true },
    { name: "code", type: "text", required: true, unique: true },
    { name: "name", type: "text", admin: { description: 'e.g. "July 2026 Group"' } },
    { name: "groupName", type: "text" },
    { name: "maxUses", type: "number", required: true, defaultValue: 100 },
    { name: "usesCount", type: "number", required: true, defaultValue: 0 },
    { name: "accessLevel", type: "select", defaultValue: "full", options: [
      { label: "Full", value: "full" }, { label: "Museums Only", value: "museums_only" }, { label: "Stories Only", value: "stories_only" },
    ]},
    { name: "validHours", type: "number", required: true, defaultValue: 48 },
    { name: "startsAt", type: "date" },
    { name: "expiresAt", type: "date" },
    { name: "isActive", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
    { name: "purchase", type: "relationship", relationTo: "agency-purchases" },
  ],
};

// ── USER CONTENT ACCESS (maps: public.user_content_access) ─
export const UserContentAccess: CollectionConfig = {
  slug: "user-content-access",
  admin: { useAsTitle: "accessType", defaultColumns: ["user", "accessType", "contentType", "expiresAt"], group: "Access" },
  access: ownerAccess,
  fields: [
    { name: "user", type: "relationship", relationTo: "users", required: true, index: true },
    { name: "accessType", type: "select", required: true, options: [
      { label: "Subscription", value: "subscription" },
      { label: "Purchase", value: "purchase" },
      { label: "Tour Code", value: "tour_code" },
      { label: "Sponsored", value: "sponsored" },
      { label: "Admin Grant", value: "admin_grant" },
    ]},
    { name: "contentType", type: "text", admin: { description: "null for subscriptions (access all)" } },
    { name: "contentId", type: "text" },
    { name: "agencyCode", type: "relationship", relationTo: "access-codes" },
    { name: "expiresAt", type: "date" },
    { name: "stripePaymentId", type: "text" },
  ],
};

// ── CODE REDEMPTIONS (maps: public.code_redemptions) ─────
export const CodeRedemptions: CollectionConfig = {
  slug: "code-redemptions",
  admin: { useAsTitle: "id", defaultColumns: ["code", "user", "redeemedAt"], group: "Access" },
  access: ownerAccess,
  fields: [
    { name: "code", type: "relationship", relationTo: "access-codes", required: true, index: true },
    { name: "user", type: "relationship", relationTo: "users", required: true },
    { name: "access", type: "relationship", relationTo: "user-content-access", required: true },
    { name: "redeemedAt", type: "date", required: true },
  ],
};

// ── AGENCY PRICING PLANS (maps: public.agency_pricing_plans) ─
export const AgencyPricingPlans: CollectionConfig = {
  slug: "agency-pricing-plans",
  admin: { useAsTitle: "name", defaultColumns: ["name", "planType", "priceCents", "isActive"], group: "Access" },
  access: publicReadAdminWrite,
  hooks: { beforeValidate: [autoSlug] },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", unique: true, required: true },
    { name: "description", type: "textarea" },
    { name: "priceCents", type: "number", required: true },
    { name: "planType", type: "select", required: true, options: [
      { label: "Per Person", value: "per_person" },
      { label: "Group Package", value: "group_package" },
      { label: "Unlimited", value: "unlimited" },
    ]},
    { name: "includedCodes", type: "number", admin: { description: "null for unlimited" } },
    { name: "validityDays", type: "number", required: true, defaultValue: 30 },
    { name: "isActive", type: "checkbox", defaultValue: true, admin: { position: "sidebar" } },
  ],
};

// ── AGENCY PURCHASES (maps: public.agency_purchases) ─────
export const AgencyPurchases: CollectionConfig = {
  slug: "agency-purchases",
  admin: { useAsTitle: "id", defaultColumns: ["agency", "plan", "status", "purchasedAt"], group: "Access" },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === "admin") return true;
      if (user?.role === "agency_admin" && user?.id)
        return { agency: { adminUser: { equals: String(user.id) } } } as any;
      return false;
    },
    create: ({ req: { user } }) => user?.role === "admin" || user?.role === "agency_admin",
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: "agency", type: "relationship", relationTo: "tour-agencies", required: true, index: true },
    { name: "plan", type: "relationship", relationTo: "agency-pricing-plans", required: true },
    { name: "quantity", type: "number", required: true, defaultValue: 1 },
    { name: "totalPriceCents", type: "number", required: true },
    { name: "codesAllocated", type: "number", required: true },
    { name: "codesRemaining", type: "number", required: true },
    { name: "purchasedAt", type: "date", required: true },
    { name: "expiresAt", type: "date" },
    { name: "stripePaymentId", type: "text" },
    { name: "status", type: "select", defaultValue: "active", options: [
      { label: "Pending", value: "pending" },
      { label: "Active", value: "active" },
      { label: "Expired", value: "expired" },
      { label: "Cancelled", value: "cancelled" },
    ]},
  ],
};

// ── SUBSCRIPTIONS (maps Stripe/Flutterwave subs) ─────────
export const Subscriptions: CollectionConfig = {
  slug: "subscriptions",
  admin: { useAsTitle: "id", defaultColumns: ["user", "plan", "status", "currentPeriodEnd"], group: "Access" },
  access: ownerAccess,
  fields: [
    { name: "user", type: "relationship", relationTo: "users", required: true },
    { name: "plan", type: "select", required: true, options: [
      { label: "Monthly ($9.99)", value: "monthly" },
      { label: "Annual ($79.99)", value: "annual" },
    ]},
    { name: "status", type: "select", required: true, options: [
      { label: "Active", value: "active" }, { label: "Past Due", value: "past_due" },
      { label: "Cancelled", value: "cancelled" }, { label: "Expired", value: "expired" }, { label: "Trial", value: "trial" },
    ]},
    { name: "stripeSubscriptionId", type: "text" },
    { name: "stripeCustomerId", type: "text" },
    { name: "flutterwaveSubscriptionId", type: "text" },
    { name: "currentPeriodStart", type: "date" },
    { name: "currentPeriodEnd", type: "date" },
    { name: "cancelledAt", type: "date" },
    { name: "paymentGateway", type: "select", options: [
      { label: "Stripe", value: "stripe" }, { label: "Flutterwave", value: "flutterwave" },
    ]},
  ],
};

// ── PAYMENTS (transaction log) ───────────────────────────
export const Payments: CollectionConfig = {
  slug: "payments",
  admin: { useAsTitle: "id", defaultColumns: ["user", "amount", "currency", "gateway", "status"], group: "Access" },
  access: ownerAccess,
  fields: [
    { name: "user", type: "relationship", relationTo: "users" },
    { name: "paymentType", type: "select", required: true, options: [
      { label: "Subscription", value: "subscription" }, { label: "One-Time", value: "one_time" }, { label: "Day Pass", value: "day_pass" },
    ]},
    { name: "amount", type: "number", required: true },
    { name: "currency", type: "select", defaultValue: "USD", options: [
      { label: "USD", value: "USD" }, { label: "EUR", value: "EUR" }, { label: "RWF", value: "RWF" },
    ]},
    { name: "gateway", type: "select", required: true, options: [
      { label: "Stripe", value: "stripe" }, { label: "Flutterwave", value: "flutterwave" },
      { label: "MTN MoMo", value: "mtn_momo" }, { label: "Access Code", value: "code" },
    ]},
    { name: "status", type: "select", options: [
      { label: "Pending", value: "pending" }, { label: "Completed", value: "completed" },
      { label: "Failed", value: "failed" }, { label: "Refunded", value: "refunded" },
    ]},
    { name: "stripePaymentIntentId", type: "text" },
    { name: "flutterwaveTransactionId", type: "text" },
    { name: "subscription", type: "relationship", relationTo: "subscriptions" },
    { name: "agency", type: "relationship", relationTo: "tour-agencies" },
  ],
};
