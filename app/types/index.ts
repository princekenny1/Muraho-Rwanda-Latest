/**
 * Muraho Rwanda — Shared Type Definitions
 * =========================================
 * These types mirror the Payload CMS collections and are used by:
 *   - Next.js API routes (server-side)
 *   - Frontend hooks (client-side, via TanStack Query)
 *   - React Native mobile app
 *
 * Matches the Lovable frontend data model inferred from:
 *   - package.json dependencies
 *   - AccessOptionsPage.tsx (access/payment flow)
 *   - Product brief (9 modules)
 */

// ═══════════════════════════════════════════════════════════
//  CORE CONTENT
// ═══════════════════════════════════════════════════════════

export type Language = "en" | "fr" | "rw";
export type SensitivityLevel = "standard" | "sensitive" | "highly_sensitive";
export type AccessLevel = "free" | "preview" | "premium";
export type ContentStatus = "draft" | "published";

export interface LocalizedField {
  en?: string;
  fr?: string;
  rw?: string;
}

export interface Story {
  id: string;
  title: string | LocalizedField;
  slug: string;
  excerpt?: string | LocalizedField;
  body: any; // Lexical rich text
  heroImage?: Media;
  category: StoryCategory;
  tags?: { tag: string }[];
  sensitivityLevel: SensitivityLevel;
  accessLevel: AccessLevel;
  price?: number;
  audioNarration?: AudioNarration[];
  location?: Location;
  relatedMuseum?: Museum;
  relatedStories?: Story[];
  relatedTestimonies?: Testimony[];
  createdAt: string;
  updatedAt: string;
}

export type StoryCategory =
  | "history" | "remembrance" | "culture" | "nature"
  | "modern" | "art" | "cuisine" | "reconciliation";

export interface AudioNarration {
  language: Language;
  audioFile: AudioFile;
  durationSeconds?: number;
  narrator?: string;
}

export interface Testimony {
  id: string;
  title: string | LocalizedField;
  slug: string;
  survivorName?: string;
  survivorAge?: number;
  survivorLocation?: string;
  isAnonymized: boolean;
  consentStatus: "full" | "partial_text" | "partial_audio" | "pending" | "withdrawn";
  contentWarning?: string | LocalizedField;
  body: any;
  excerpt?: string | LocalizedField;
  heroImage?: Media;
  audioTestimony?: AudioFile;
  audioDurationSeconds?: number;
  sensitivityLevel: SensitivityLevel;
  accessLevel: AccessLevel;
  themes?: TestimonyTheme[];
  memorial?: Museum;
  location?: Location;
  createdAt: string;
  updatedAt: string;
}

export type TestimonyTheme =
  | "survival" | "resilience" | "loss" | "reconciliation"
  | "rescue" | "displacement" | "return" | "justice";

// ═══════════════════════════════════════════════════════════
//  PLACES
// ═══════════════════════════════════════════════════════════

export interface Museum {
  id: string;
  name: string | LocalizedField;
  slug: string;
  type: MuseumType;
  description?: any;
  shortDescription?: string | LocalizedField;
  heroImage?: Media;
  gallery?: { image: Media; caption?: string }[];
  location: Location;
  city?: string;
  province?: string;
  visitInfo?: VisitInfo;
  // Spatial experiences
  floorPlans?: FloorPlan[];
  virtualTour?: VirtualTour;
  arExperience?: ARExperience;
  hasIndoorNavigation: boolean;
  // Relations
  exhibits?: MuseumExhibit[];
  relatedStories?: Story[];
  relatedRoutes?: Route[];
  sensitivityLevel: SensitivityLevel;
}

export type MuseumType =
  | "genocide_memorial" | "museum" | "cultural_center"
  | "heritage_site" | "national_park";

export interface VisitInfo {
  openingHours?: string;
  admissionFee?: string;
  guidedToursAvailable?: boolean;
  accessibilityNotes?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
}

export interface MuseumExhibit {
  id: string;
  title: string | LocalizedField;
  museum: Museum;
  exhibitType: "room" | "panel" | "artifact" | "interactive" | "memorial_wall" | "outdoor";
  room?: string;
  orderIndex?: number;
  description?: any;
  image?: Media;
  audioGuide?: AudioFile;
  audioDurationSeconds?: number;
  // Indoor positioning
  floorPlan?: FloorPlan;
  positionOnFloorPlan?: { x: number; y: number };
  triggerBeacon?: Beacon;
  arAnchor?: ARAnchor;
  sensitivityLevel: SensitivityLevel;
}

export interface Route {
  id: string;
  name: string | LocalizedField;
  slug: string;
  description?: any;
  shortDescription?: string | LocalizedField;
  heroImage?: Media;
  difficulty?: "easy" | "moderate" | "challenging";
  estimatedHours?: number;
  distanceKm?: number;
  transportMode?: ("walking" | "driving" | "mixed" | "cycling")[];
  stops: RouteStop[];
  routePath?: GeoJSON.LineString;
  accessLevel: AccessLevel;
  price?: number;
  category?: RouteCategory;
  sensitivityLevel: SensitivityLevel;
  offlineAvailable: boolean;
}

export type RouteCategory =
  | "remembrance" | "cultural" | "nature" | "urban" | "historical";

export interface RouteStop {
  id: string;
  name: string | LocalizedField;
  description?: any;
  image?: Media;
  stopType?: "museum" | "viewpoint" | "cultural" | "rest" | "story_point";
  orderIndex: number;
  location: Location;
  triggerRadiusMeters: number;
  audioGuide?: AudioFile;
  audioDurationSeconds?: number;
  relatedStory?: Story;
  relatedMuseum?: Museum;
  estimatedMinutes?: number;
  facilities?: string[];
}

export interface Location {
  id: string;
  name: string | LocalizedField;
  slug: string;
  locationType: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  boundaryGeoJSON?: GeoJSON.Polygon;
  address?: Address;
  mapIcon?: string;
  sensitivityLevel: SensitivityLevel;
}

export interface Address {
  street?: string;
  city?: string;
  district?: string;
  province?: string;
  country?: string;
}

// ═══════════════════════════════════════════════════════════
//  SPATIAL EXPERIENCES
// ═══════════════════════════════════════════════════════════

export interface FloorPlan {
  id: string;
  name: string;
  museum: Museum;
  floorLevel: number;
  floorLabel?: string | LocalizedField;
  planImage: Media;
  imageDimensions: { width: number; height: number };
  geoAnchors?: GeoAnchor[];
  zones?: FloorZone[];
  suggestedPath?: number[][];
  beaconCount: number;
}

export interface GeoAnchor {
  pixelX: number;
  pixelY: number;
  latitude: number;
  longitude: number;
  label?: string;
}

export interface FloorZone {
  zoneName: string | LocalizedField;
  zoneType: string;
  boundaryPolygon?: number[][];
  sensitivityLevel: SensitivityLevel;
}

export interface Beacon {
  id: string;
  label: string;
  beaconProtocol: "ibeacon" | "eddystone";
  uuid?: string;
  major?: number;
  minor?: number;
  namespace?: string;
  instanceId?: string;
  macAddress?: string;
  museum: Museum;
  floorPlan: FloorPlan;
  positionOnPlan: { x: number; y: number };
  transmitPower?: number;
  triggerExhibit?: MuseumExhibit;
  triggerStory?: Story;
  triggerRadiusMeters: number;
  triggerAction: "show_content" | "play_audio" | "notification" | "position_only";
  beaconStatus: "active" | "inactive" | "low_battery" | "maintenance" | "not_installed";
  batteryLevel?: number;
  lastSeenAt?: string;
}

export interface VirtualTour {
  id: string;
  title: string | LocalizedField;
  slug: string;
  museum: Museum;
  description?: string | LocalizedField;
  heroImage?: Media;
  startPanorama?: Panorama;
  panoramas: Panorama[];
  panoramaCount: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
  compassEnabled: boolean;
  showMiniMap: boolean;
  backgroundAudio?: AudioFile;
  accessLevel: AccessLevel;
  sensitivityLevel: SensitivityLevel;
  contentWarning?: string | LocalizedField;
  estimatedMinutes?: number;
}

export interface Panorama {
  id: string;
  title: string | LocalizedField;
  virtualTour?: VirtualTour;
  url: string; // Image URL
  initialView: { pitch: number; yaw: number; hfov: number };
  room?: string;
  floorPlan?: FloorPlan;
  positionOnPlan?: { x: number; y: number };
  latitude?: number;
  longitude?: number;
  hotspots: PanoramaHotspot[];
  ambientAudio?: AudioFile;
  narratorAudio?: AudioFile;
  sensitivityLevel: SensitivityLevel;
  contentWarning?: string | LocalizedField;
}

export interface PanoramaHotspot {
  hotspotType: "navigation" | "info" | "audio" | "story" | "exhibit";
  pitch: number;
  yaw: number;
  label?: string | LocalizedField;
  icon?: string;
  targetPanorama?: Panorama;
  targetStory?: Story;
  targetExhibit?: MuseumExhibit;
  audioFile?: AudioFile;
  infoText?: any;
  transitionType?: "fade" | "zoom" | "slide";
}

export interface ARExperience {
  id: string;
  title: string | LocalizedField;
  slug: string;
  museum: Museum;
  description?: string | LocalizedField;
  arType: "image_marker" | "location_based" | "world_tracking";
  anchors: ARAnchor[];
  anchorCount: number;
  instructions?: string | LocalizedField;
  instructionImage?: Media;
  fallbackContent?: any;
  accessLevel: AccessLevel;
  sensitivityLevel: SensitivityLevel;
  contentWarning?: string | LocalizedField;
  requirements?: ARRequirements;
}

export interface ARAnchor {
  id: string;
  label: string;
  anchorType: "image_marker" | "gps" | "spatial";
  markerImage?: Media;
  markerWidthMeters?: number;
  gpsPosition?: { latitude: number; longitude: number; altitude?: number; heading?: number };
  spatialPosition?: { x: number; y: number; z: number; rotationY?: number; scale?: number };
  contentType: ARContentType;
  overlayTitle?: string | LocalizedField;
  overlayText?: any;
  overlayImage?: Media;
  overlayImageOpacity?: number;
  modelUrl?: string;
  modelScale?: number;
  audioFile?: AudioFile;
  interactionType: "auto" | "tap" | "gaze" | "proximity";
  linkedStory?: Story;
  linkedExhibit?: MuseumExhibit;
  linkedTestimony?: Testimony;
  sensitivityLevel: SensitivityLevel;
}

export type ARContentType =
  | "text_overlay" | "info_card" | "photo_overlay" | "3d_model"
  | "audio" | "video" | "name_highlight" | "timeline";

export interface ARRequirements {
  needsCamera: boolean;
  needsGyroscope: boolean;
  needsGPS: boolean;
  needsLiDAR: boolean;
  minimumIOSVersion: string;
  minimumAndroidVersion: string;
}

// ═══════════════════════════════════════════════════════════
//  ACCESS CONTROL & PAYMENTS
// ═══════════════════════════════════════════════════════════

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: UserRole;
  agency?: Agency;
  preferredLanguage: Language;
  accessTier: AccessTier;
  avatar?: Media;
}

export type UserRole = "visitor" | "content_creator" | "agency_operator" | "museum_staff" | "admin";
export type AccessTier = "free" | "day_pass" | "subscriber" | "agency";

export interface Agency {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  tier: "basic" | "professional" | "enterprise";
  status: "active" | "suspended" | "trial";
  activeCodesCount: number;
  commission: number;
}

export interface AccessCode {
  id: string;
  code: string;
  codeType: "tour_group" | "single_use" | "promo" | "qr_code";
  agency?: Agency;
  grantsAccess: "full" | "day_pass" | "route" | "museum" | "story";
  grantedRoute?: Route;
  grantedMuseum?: Museum;
  grantedStory?: Story;
  maxUses: number;
  usedCount: number;
  expiresAt?: string;
  durationDays: number;
}

export interface Subscription {
  id: string;
  user: User;
  plan: "monthly" | "annual";
  status: "active" | "past_due" | "cancelled" | "expired" | "trial";
  stripeSubscriptionId?: string;
  flutterwaveSubscriptionId?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  paymentGateway: "stripe" | "flutterwave";
}

export interface Payment {
  id: string;
  user?: User;
  paymentType: "subscription" | "one_time" | "day_pass";
  amount: number;
  currency: "USD" | "EUR" | "GBP" | "RWF";
  gateway: "stripe" | "flutterwave" | "mtn_momo" | "code";
  status: "pending" | "completed" | "failed" | "refunded";
  stripePaymentIntentId?: string;
  flutterwaveTransactionId?: string;
}

// ═══════════════════════════════════════════════════════════
//  AI / ASK RWANDA
// ═══════════════════════════════════════════════════════════

export type AIMode = "standard" | "personal_voices" | "kid_friendly";

export interface AskRwandaRequest {
  query: string;
  language?: Language;
  mode?: AIMode;
  context?: {
    current_page?: string;
    museum_id?: string;
    route_id?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
  };
  stream?: boolean;
}

export interface AskRwandaResponse {
  answer: string;
  sources: AskRwandaSource[];
  mode: AIMode;
  language: Language;
  safetyFiltered: boolean;
  relatedContent?: {
    stories?: { id: string; title: string; slug: string }[];
    routes?: { id: string; name: string; slug: string }[];
    museums?: { id: string; name: string; slug: string }[];
  };
}

export interface AskRwandaSource {
  id: string;
  type: string;
  title: string;
  relevance: number;
}

// ═══════════════════════════════════════════════════════════
//  MEDIA
// ═══════════════════════════════════════════════════════════

export interface Media {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  width?: number;
  height?: number;
  alt?: string | LocalizedField;
  caption?: string | LocalizedField;
  credit?: string;
  sizes?: {
    thumbnail?: { url: string; width: number; height: number };
    card?: { url: string; width: number; height: number };
    hero?: { url: string; width: number; height: number };
  };
}

export interface AudioFile {
  id: string;
  url: string;
  filename: string;
  title: string;
  language?: Language;
  durationSeconds?: number;
  narrator?: string;
  transcription?: string;
}

// ═══════════════════════════════════════════════════════════
//  MAP
// ═══════════════════════════════════════════════════════════

export interface MapFeature {
  type: "Feature";
  id: string;
  geometry: {
    type: "Point";
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    name: string;
    type: string;
    sensitivity: SensitivityLevel;
    icon?: string;
    payload_id: string;
  };
}

export interface MapFeatureCollection {
  type: "FeatureCollection";
  features: MapFeature[];
}

// ═══════════════════════════════════════════════════════════
//  API RESPONSE WRAPPERS
// ═══════════════════════════════════════════════════════════

export interface PaginatedResponse<T> {
  docs: T[];
  totalDocs: number;
  limit: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface APIError {
  error: string;
  message: string;
  statusCode: number;
}

// ═══════════════════════════════════════════════════════════
//  CHOOSE YOUR PATH (Mode System)
// ═══════════════════════════════════════════════════════════

export interface PathChoice {
  journeyMood: "reflective" | "curious" | "adventurous" | "peaceful";
  explorationStyle: "guided" | "freeform" | "curated";
  experienceMode: AIMode;
}

export interface UserSession {
  user?: User;
  accessTier: AccessTier;
  pathChoice?: PathChoice;
  language: Language;
  tourGroupAccess?: TourGroupAccess;
  hasSubscription: boolean;
  purchasedContent: string[];  // IDs of unlocked stories/routes
}

export interface TourGroupAccess {
  code: string;
  agency?: Agency;
  grantsAccess: string;
  expiresAt: string;
  groupName?: string;
}
