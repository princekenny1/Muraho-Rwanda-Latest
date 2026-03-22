/**
 * Muraho Rwanda — Shared Types
 * =============================
 * Shared between web frontend and React Native mobile.
 *
 * Import in web:    import type { Museum, Story } from "@/types/shared"
 * Import in mobile: import type { Museum, Story } from "@shared/types"
 */

// ── Core entities ─────────────────────────────────────────

export interface Museum {
  id: string;
  name: string;
  slug: string;
  description?: string;
  latitude: number;
  longitude: number;
  coverImage?: MediaField;
  address?: string;
  openingHours?: string;
  contactPhone?: string;
  contactEmail?: string;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
  description?: string;
  locationType: "genocide_memorial" | "cultural_site" | "natural_site" | "historical" | "museum";
  latitude: number;
  longitude: number;
  coverImage?: MediaField;
  province?: string;
  district?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Story {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  coverImage?: MediaField;
  language: "en" | "fr" | "rw";
  sensitivityLevel: "standard" | "sensitive";
  status: "draft" | "published" | "archived";
  isFeatured: boolean;
  estimatedReadMinutes?: number;
  themes?: Theme[];
  locations?: Location[];
  storyBlocks?: StoryBlock[];
  createdAt: string;
  updatedAt: string;
}

export interface StoryBlock {
  id: string;
  blockType: "text" | "image" | "audio" | "video" | "quote" | "pull_quote" | "timeline_event" | "branch";
  text?: string;
  image?: MediaField;
  audioUrl?: string;
  videoUrl?: string;
  quote?: string;
  attribution?: string;
  caption?: string;
}

export interface Route {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: MediaField;
  estimatedDurationMinutes: number;
  distanceKm: number;
  difficulty?: "easy" | "moderate" | "challenging";
  status: "draft" | "published" | "archived";
  path?: GeoJSONLineString;
  stops?: RouteStop[];
  createdAt: string;
  updatedAt: string;
}

export interface RouteStop {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
  estimatedTimeMinutes?: number;
  description?: string;
  image?: MediaField;
  markerIcon?: string;
  markerColor?: string;
}

export interface Testimony {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  biography?: string;
  survivorName: string;
  thumbnailImage?: MediaField;
  audioUrl?: string;
  language: "en" | "fr" | "rw";
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Documentary {
  id: string;
  title: string;
  slug: string;
  description?: string;
  synopsis?: string;
  coverImage?: MediaField;
  durationMinutes?: number;
  releaseYear?: number;
  chapters?: DocumentaryChapter[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentaryChapter {
  id: string;
  title: string;
  description?: string;
  startTimeSeconds: number;
  endTimeSeconds?: number;
  thumbnailUrl?: string;
}

export interface Theme {
  id: string;
  title: string;
  slug: string;
  description?: string;
  coverImage?: MediaField;
  color?: string;
}

// ── User / Auth ───────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  accessTier: AccessTier;
  preferredLanguage: Language;
  avatar?: MediaField;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "visitor" | "content_creator" | "agency_operator" | "museum_staff" | "admin";
export type AccessTier = "free" | "day_pass" | "subscriber" | "agency";
export type Language = "en" | "fr" | "rw";

// ── Map / Spatial ─────────────────────────────────────────

export interface MapPoint {
  id: string;
  type: "museum" | "location" | "route_stop" | "outdoor_stop" | "story";
  title: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  slug?: string;
  imageUrl?: string;
}

export interface GeoJSONLineString {
  type: "LineString";
  coordinates: [number, number][];
}

export interface RouteLine {
  routeId: string;
  routeTitle: string;
  color: string;
  path: GeoJSONLineString;
}

// ── AI ────────────────────────────────────────────────────

export interface AskRwandaRequest {
  query: string;
  mode: "standard" | "personal_voices" | "kid_friendly";
  context?: { type: string; id: string; title?: string };
  language?: Language;
  stream?: boolean;
}

export interface AskRwandaResponse {
  answer: string;
  sources?: { id: string; type: string; title: string; relevance: number }[];
  language: Language;
  mode: string;
  safetyFlags?: string[];
}

// ── Media ─────────────────────────────────────────────────

export interface MediaField {
  id?: string;
  url: string;
  alt?: string;
  width?: number;
  height?: number;
  mimeType?: string;
  sizes?: Record<string, { url: string; width: number; height: number }>;
}

// ── Pagination ────────────────────────────────────────────

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

// ── Search ────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string | null;
  score: number;
}
