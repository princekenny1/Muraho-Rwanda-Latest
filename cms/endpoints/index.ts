/**
 * Muraho Rwanda — Custom Endpoint Registry
 * Registers all custom API routes into Payload CMS.
 *
 * Routes:
 *   POST /api/import-exhibition       — Bulk ZIP import for museums
 *   POST /api/spatial/nearby          — Points within radius
 *   POST /api/spatial/bbox            — Points within viewport bounds
 *   POST /api/spatial/layers          — Aggregated map layers
 *   GET  /api/spatial/route           — Route GeoJSON + stops
 *   POST /api/webhooks/stripe         — Stripe payment webhook
 *   POST /api/webhooks/flutterwave    — Flutterwave payment webhook
 *   GET  /api/search                  — Global search across collections
 *   POST /api/payments/create-checkout — Create payment checkout session
 *   GET  /api/health                  — System health check
 */
import type { Endpoint } from "payload";

import { importExhibition } from "./importExhibition";
import {
  spatialNearby,
  spatialBbox,
  spatialLayers,
  spatialRoute,
} from "./spatial";
import { stripeWebhook, flutterwaveWebhook } from "./webhooks";
import { searchEndpoint } from "./search";
import { createCheckout } from "./payments";
import { cancelSubscription, subscriptionStatus } from "./subscriptions";
import { trackEvent, analyticsSummary, agencyAnalytics } from "./analytics";
import { healthEndpoint } from "./health";
import { redeemCode } from "./redeem";

export const customEndpoints: Endpoint[] = [
  // ── Access Code Redemption ───────────────────────────
  { path: "/access-codes/redeem", method: "post", handler: redeemCode },

  // ── Import ─────────────────────────────────────────────
  { path: "/import-exhibition", method: "post", handler: importExhibition },

  // ── Spatial / Map ──────────────────────────────────────
  { path: "/spatial/nearby", method: "post", handler: spatialNearby },
  { path: "/spatial/bbox", method: "post", handler: spatialBbox },
  { path: "/spatial/layers", method: "post", handler: spatialLayers },
  { path: "/spatial/route", method: "get", handler: spatialRoute },

  // ── Payment Webhooks ───────────────────────────────────
  { path: "/webhooks/stripe", method: "post", handler: stripeWebhook },
  {
    path: "/webhooks/flutterwave",
    method: "post",
    handler: flutterwaveWebhook,
  },

  // ── Search ─────────────────────────────────────────────
  searchEndpoint,

  // ── Payments ───────────────────────────────────────────
  {
    path: "/payments/create-checkout",
    method: "post",
    handler: createCheckout,
  },
  {
    path: "/payments/cancel-subscription",
    method: "post",
    handler: cancelSubscription,
  },
  {
    path: "/payments/subscription-status",
    method: "get",
    handler: subscriptionStatus,
  },

  // ── Analytics ──────────────────────────────────────────
  { path: "/analytics/track", method: "post", handler: trackEvent },
  { path: "/analytics/summary", method: "get", handler: analyticsSummary },
  { path: "/analytics/agency", method: "get", handler: agencyAnalytics },

  // ── Health Check ───────────────────────────────────────
  { path: "/health", method: "get", handler: healthEndpoint },
];
