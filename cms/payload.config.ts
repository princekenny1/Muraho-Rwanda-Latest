/**
 * Muraho Rwanda — Payload CMS 3.0 Configuration
 * ================================================
 * 38 collections mapping all 47 Supabase tables.
 * (Some Supabase tables are embedded as arrays in parent collections.)
 * PostgreSQL + pgvector + PostGIS backend.
 */
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import path from "path";
import { en } from "@payloadcms/translations/languages/en";
import { fr } from "@payloadcms/translations/languages/fr";

// ── Users & Media ────────────────────────────────────────
import { Users } from "./collections/Users";
import { Media, AudioFiles } from "./collections/Media";

// ── Content CMS (10 collections) ─────────────────────────
import {
  People,
  Themes,
  Locations,
  HistoricalEvents,
  Stories,
  StoryBlocks,
  Quotes,
  ContentTags,
  ContentEmbeddings,
  DocumentaryClips,
} from "./collections/ContentCMS";

// ── Documentaries ────────────────────────────────────────
import { Documentaries } from "./collections/Documentaries";

// ── Testimonies ──────────────────────────────────────────
import { Testimonies } from "./collections/Testimonies";

// ── Exhibitions ──────────────────────────────────────────
import { MuseumExhibits } from "./collections/MuseumExhibits";

// ── Museums (5 collections) ──────────────────────────────
import {
  Museums,
  MuseumOutdoorStops,
  MuseumRooms,
  MuseumPanels,
} from "./collections/Museums";

// ── VR (2 collections) ──────────────────────────────────
import { VRScenes, VRHotspots } from "./collections/VR";

// ── Routes (5 collections) ──────────────────────────────
import {
  Routes,
  RouteStops,
  StopContentBlocks,
  RouteVersions,
  RouteComments,
} from "./collections/Routes";

// ── Access Control (10 collections) ──────────────────────
import {
  Sponsors,
  ContentAccess,
  TourAgencies,
  AgencyAccessCodes,
  UserContentAccess,
  CodeRedemptions,
  AgencyPricingPlans,
  AgencyPurchases,
  Subscriptions,
  Payments,
} from "./collections/AccessControl";

// ── User Data (4 collections) ───────────────────────────
import {
  UserSettings,
  UserSavedItems,
  UserProgress,
  UserDownloads,
} from "./collections/UserData";

// ── Analytics (2 collections) ───────────────────────────
import {
  AnalyticsEvents,
  AnalyticsDailyAggregates,
} from "./collections/Analytics";

// ── Globals ─────────────────────────────────────────────
import { SiteSettings } from "./globals/SiteSettings";

// ── Custom Endpoints ────────────────────────────────────
import { customEndpoints } from "./endpoints";

export default buildConfig({
  // ── Security ──────────────────────────────────────────
  // ── Secret validation — NEVER deploy with default ────────────
  secret: (() => {
    const s = process.env.PAYLOAD_SECRET;
    if (!s || s.includes("CHANGE-THIS")) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          "FATAL: PAYLOAD_SECRET must be set in production. Generate one: openssl rand -hex 32",
        );
      }
      console.warn(
        "⚠️  WARNING: Using default PAYLOAD_SECRET — set a strong secret before deploying!",
      );
      return "dev-only-insecure-secret-do-not-deploy";
    }
    return s;
  })(),

  // ── Server URL for API requests (required for admin UI authentication) ──────
  serverURL: (() => {
    if (process.env.NODE_ENV === "production") {
      return process.env.PAYLOAD_PUBLIC_SERVER_URL || "https://muraho.rw";
    }
    // Development: use environment variable or default to localhost
    return process.env.PAYLOAD_PUBLIC_SERVER_URL || "http://localhost:3000";
  })(),

  // ── Cookie security — httpOnly + Secure in production ──────
  cookiePrefix: "mrw",

  // ── CORS — restrict to known origins ──────────────────
  cors: [
    process.env.APP_URL || "https://muraho.rw",
    process.env.FRONTEND_URL || "https://muraho.rw",
    process.env.PAYLOAD_PUBLIC_SERVER_URL,
    "http://localhost:3000",
    ...(process.env.NODE_ENV === "development"
      ? [
          "http://localhost:5173",
          "http://localhost:3000",
          "http://localhost:8080",
        ]
      : []),
  ].filter((origin): origin is string => Boolean(origin)),

  // ── CSRF protection ───────────────────────────────────
  csrf: [
    process.env.APP_URL || process.env.FRONTEND_URL || "https://muraho.rw",
    process.env.FRONTEND_URL,
    process.env.PAYLOAD_PUBLIC_SERVER_URL,
    "http://localhost:3000",
    ...(process.env.NODE_ENV === "development"
      ? [
          "http://localhost:5173",
          "http://localhost:3000",
          "http://localhost:8080",
        ]
      : []),
  ].filter((origin): origin is string => Boolean(origin)),

  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: " — Muraho Rwanda",
      icons: [{ rel: "icon", type: "image/png", url: "/favicon.png" }],
      openGraph: { images: [{ url: "/og-image.png" }] },
    },
  },

  editor: lexicalEditor({}),

  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI! },
    schemaName: "muraho",
  }),

  collections: [
    // Auth
    Users,

    // Media
    Media,
    AudioFiles,

    // Content CMS
    People,
    Themes,
    Locations,
    HistoricalEvents,
    Stories,
    StoryBlocks,
    Quotes,
    ContentTags,
    ContentEmbeddings,
    DocumentaryClips,

    // Documentaries (chapters + transcripts embedded)
    Documentaries,

    // Testimonies
    Testimonies,

    // Exhibitions (panels + blocks embedded)
    MuseumExhibits,

    // Museums
    Museums,
    MuseumOutdoorStops,
    MuseumRooms,
    MuseumPanels,

    // VR
    VRScenes,
    VRHotspots,

    // Routes
    Routes,
    RouteStops,
    StopContentBlocks,
    RouteVersions,
    RouteComments,

    // Access Control
    Sponsors,
    ContentAccess,
    TourAgencies,
    AgencyAccessCodes,
    UserContentAccess,
    CodeRedemptions,
    AgencyPricingPlans,
    AgencyPurchases,
    Subscriptions,
    Payments,

    // User Data
    UserSettings,
    UserSavedItems,
    UserProgress,
    UserDownloads,

    // Analytics
    AnalyticsEvents,
    AnalyticsDailyAggregates,
  ],

  globals: [SiteSettings],

  endpoints: customEndpoints,

  plugins: [
    s3Storage({
      collections: {
        media: { prefix: "media" },
        "audio-files": { prefix: "audio" },
      },
      bucket: process.env.S3_BUCKET!,
      config: {
        endpoint: process.env.S3_ENDPOINT,
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY!,
          secretAccessKey: process.env.S3_SECRET_KEY!,
        },
        region: process.env.S3_REGION || "us-east-1",
        forcePathStyle: true,
      },
    }),
  ],

  typescript: {
    outputFile: path.resolve(__dirname, "payload-types.ts"),
  },

  i18n: {
    supportedLanguages: { en, fr },
    fallbackLanguage: "en",
  },
});
