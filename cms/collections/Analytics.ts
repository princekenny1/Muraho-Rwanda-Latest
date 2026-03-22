/**
 * Analytics Collections — Event tracking and engagement metrics
 *
 * Tracks: page views, content plays, code activations, search queries,
 *         session durations, and feature usage.
 *
 * Privacy: Hashes IP addresses, no PII stored in events.
 * Retention: Auto-prune events older than 90 days via cron hook.
 */

import type { CollectionConfig } from "payload";
import { isAdmin } from "../access";

// ── ANALYTICS EVENTS (page views, plays, interactions) ───────────────────────

export const AnalyticsEvents: CollectionConfig = {
  slug: "analytics-events",
  admin: {
    useAsTitle: "eventType",
    defaultColumns: ["eventType", "contentType", "sessionId", "createdAt"],
    group: "Analytics",
  },
  access: {
    read: isAdmin,
    create: ({ req: { user } }) => !!user, // Any authenticated user can create events
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "eventType",
      type: "select",
      required: true,
      index: true,
      options: [
        { label: "Page View", value: "page_view" },
        { label: "Content Play", value: "content_play" },
        { label: "Content Complete", value: "content_complete" },
        { label: "Content Pause", value: "content_pause" },
        { label: "Search", value: "search" },
        { label: "Code Redeem", value: "code_redeem" },
        { label: "Code Activate", value: "code_activate" },
        { label: "Checkout Start", value: "checkout_start" },
        { label: "Checkout Complete", value: "checkout_complete" },
        { label: "Share", value: "share" },
        { label: "Download", value: "download" },
        { label: "Map Interaction", value: "map_interaction" },
        { label: "AI Query", value: "ai_query" },
        { label: "Session Start", value: "session_start" },
        { label: "Session End", value: "session_end" },
        { label: "Error", value: "error" },
      ],
    },
    // Content reference (what was viewed/played)
    {
      name: "contentType",
      type: "select",
      options: [
        { label: "Story", value: "story" },
        { label: "Route", value: "route" },
        { label: "Route Stop", value: "route_stop" },
        { label: "Testimony", value: "testimony" },
        { label: "Documentary", value: "documentary" },
        { label: "Exhibition", value: "exhibition" },
        { label: "Museum", value: "museum" },
        { label: "Location", value: "location" },
        { label: "VR Scene", value: "vr_scene" },
        { label: "Theme", value: "theme" },
        { label: "Page", value: "page" },
      ],
      index: true,
    },
    { name: "contentId", type: "text", index: true },
    { name: "contentTitle", type: "text" },

    // User context (nullable for anonymous tracking)
    { name: "user", type: "relationship", relationTo: "users" },
    { name: "sessionId", type: "text", index: true, admin: { description: "Browser session identifier" } },
    { name: "accessLevel", type: "select", options: [
      { label: "Free", value: "free" },
      { label: "Premium", value: "premium" },
      { label: "Tour Code", value: "tour_code" },
      { label: "Agency", value: "agency" },
    ]},

    // Engagement metrics
    { name: "durationSeconds", type: "number", admin: { description: "Time spent on content (seconds)" } },
    { name: "progressPercent", type: "number", min: 0, max: 100 },
    { name: "interactionCount", type: "number", defaultValue: 1, admin: { description: "Number of interactions in this event" } },

    // Context
    { name: "pagePath", type: "text", admin: { description: "URL path when event occurred" } },
    { name: "referrer", type: "text" },
    { name: "deviceType", type: "select", options: [
      { label: "Mobile", value: "mobile" },
      { label: "Tablet", value: "tablet" },
      { label: "Desktop", value: "desktop" },
    ]},
    { name: "country", type: "text", admin: { description: "Derived from IP geolocation" } },
    { name: "ipHash", type: "text", admin: { description: "SHA-256 hash of IP (privacy-safe)" } },

    // Flexible metadata
    { name: "metadata", type: "json", admin: { description: "Additional event-specific data" } },
  ],
};

// ── DAILY AGGREGATES (pre-computed for dashboard performance) ─────────────────

export const AnalyticsDailyAggregates: CollectionConfig = {
  slug: "analytics-daily",
  admin: {
    useAsTitle: "date",
    defaultColumns: ["date", "pageViews", "uniqueUsers", "contentPlays"],
    group: "Analytics",
  },
  access: {
    read: isAdmin,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: "date", type: "text", required: true, unique: true, index: true, admin: { description: "YYYY-MM-DD" } },

    // Traffic
    { name: "pageViews", type: "number", defaultValue: 0 },
    { name: "uniqueUsers", type: "number", defaultValue: 0 },
    { name: "newUsers", type: "number", defaultValue: 0 },
    { name: "sessions", type: "number", defaultValue: 0 },

    // Content engagement
    { name: "contentPlays", type: "number", defaultValue: 0 },
    { name: "contentCompletes", type: "number", defaultValue: 0 },
    { name: "avgDurationSeconds", type: "number", defaultValue: 0 },

    // Revenue
    { name: "subscriptionsCreated", type: "number", defaultValue: 0 },
    { name: "codesRedeemed", type: "number", defaultValue: 0 },
    { name: "revenueCents", type: "number", defaultValue: 0 },

    // AI usage
    { name: "aiQueries", type: "number", defaultValue: 0 },

    // Top content (JSON arrays for dashboard)
    { name: "topContent", type: "json", admin: { description: "[{id, title, type, views}]" } },
    { name: "topLocations", type: "json", admin: { description: "[{country, count}]" } },
    { name: "deviceBreakdown", type: "json", admin: { description: "{mobile, tablet, desktop}" } },
  ],
};
