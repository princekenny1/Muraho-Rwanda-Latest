# Muraho Rwanda — Frontend → Backend Integration Map

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│  LOVABLE FRONTEND (React 18 + Vite + TypeScript)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐│
│  │ Pages    │  │Components│  │ Hooks    │  │ @/integrations/  ││
│  │ (48 tsx) │  │ (shadcn) │  │ (TanQ)  │  │ supabase/client  ││
│  └────┬─────┘  └──────────┘  └────┬─────┘  └────────┬─────────┘│
│       │                           │                   │          │
│       └───────────────────────────┴───────────────────┘          │
│                              │ REST + SSE                        │
└──────────────────────────────┼───────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  PAYLOAD CMS 3.0 + NEXT.JS 15 (replaces Supabase)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │Collections│  │ Globals  │  │ Hooks    │  │ REST API       │  │
│  │ (22)     │  │ (2)      │  │ (embed)  │  │ /api/[slug]    │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────┬────────┘  │
│                                                     │           │
│  ┌──────────────────────────────────────────────────┘           │
│  │  PostgreSQL + pgvector + PostGIS                             │
│  │  MinIO (S3)  │  Redis  │  CDN                               │
│  └──────────────────────────────────────────────────────────────│
│                              │ Internal HTTP                     │
└──────────────────────────────┼───────────────────────────────────┘
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│  AI SERVICE (FastAPI + vLLM/Ollama)                             │
│  Mistral 7B │ Mixtral 8×7B │ Whisper │ NLLB-200 │ e5-large    │
└──────────────────────────────────────────────────────────────────┘
```

---

## Supabase → Payload CMS Migration Key

| Lovable Pattern | Payload CMS Equivalent |
|---|---|
| `supabase.from("table").select("*")` | `fetch("/api/stories?limit=10")` or `payload.find({ collection: "stories" })` |
| `supabase.from("table").eq("slug", slug).single()` | `fetch("/api/stories?where[slug][equals]=slug&limit=1")` |
| `supabase.auth.signIn()` | `fetch("/api/users/login", { body: { email, password } })` |
| `supabase.auth.getUser()` | `fetch("/api/users/me")` |
| `useQuery({ queryFn: () => supabase... })` | `useQuery({ queryFn: () => fetch("/api/...") })` — TanStack Query stays |
| `supabase.storage.from("bucket")` | MinIO via Payload media uploads — URLs from `/api/media` |
| Supabase RLS policies | Payload `access` functions per collection |
| `supabase.from("user_roles")` | Payload Users.role field |

---

## Page-by-Page Integration Map

### 1. PUBLIC VISITOR PAGES

#### Home.tsx
**Data needs:**
- Featured story → `GET /api/stories?where[accessLevel][equals]=free&sort=-createdAt&limit=1`
- Nearby stories → `GET /api/stories?where[location][near]=[-1.94,29.87]&limit=5` (PostGIS)
- Map markers → `GET /api/locations?limit=50` (all published locations)
- Popular routes → `GET /api/routes?sort=-viewCount&limit=5`
- Tour group access → `GET /api/access-codes/check` (validates user's active codes)
- Subscription status → `GET /api/subscriptions?where[user][equals]=currentUser`

**Components → Collections:**
- `HeroSection` → `stories` (featured)
- `PopularRoutes` → `routes` + `route-stops`
- `StoryThemes` → `stories` grouped by category
- `FeaturedDocumentary` → future `documentaries` collection
- `MapView` → `locations` (PostGIS query)
- `AccessStatusWidget` → `subscriptions` + `access-codes`
- `PersonalDashboard` → `ai-conversations` (recent) + user progress
- `FeaturedFreeContent` → `stories?where[accessLevel][equals]=free`

**Hooks to migrate:**
- `useContentAccess` → calls `/api/users/me` (includes `accessTier`, active subscription, agency codes)

---

#### StoryViewer.tsx
**Data needs:**
- Story by ID → `GET /api/stories/:id?depth=2` (includes location, related stories, testimonies)
- Audio narration → story.audioNarration array (references `audio-files` collection)
- Story segments → embedded in story body (Lexical rich text blocks)

**Components → Collections:**
- `MultiModalStoryContainer` → `stories.body` (Lexical → rendered blocks)
- `ThenNowSlider` → `stories.heroImage` + additional image field
- `SoundbedPicker` → `audio-files` (ambient audio tracks)
- `BranchingNarrative` → `stories.relatedStories` (graph navigation)
- `SourceChips` → embedded source metadata in story
- `ContentWarning` → `stories.sensitivityLevel` triggers warning

**Hooks to migrate:**
- `useProgressTracking` → new `user-progress` collection or localStorage + sync
- `useTimeOfDay` → client-side only (ambient provider)

---

#### RoutePage.tsx / RouteViewer.tsx
**Data needs:**
- Route by slug → `GET /api/routes?where[slug][equals]=:slug&depth=2`
- Route stops (ordered) → `GET /api/route-stops?where[route][equals]=:routeId&sort=orderIndex`
- Stop content blocks → each stop's `relatedStory`, `audioGuide`, `relatedMuseum`

**Supabase queries to replace (from RouteViewer.tsx):**
```typescript
// OLD:
supabase.from("routes").select("*").eq("slug", slug).single()
supabase.from("route_stops").select("*").eq("route_id", routeData.id).order("stop_order")

// NEW:
fetch(`/api/routes?where[slug][equals]=${slug}&depth=1&limit=1`)
fetch(`/api/route-stops?where[route][equals]=${routeId}&sort=orderIndex`)
```

**Components → Collections:**
- Route hero + metadata → `routes` (name, difficulty, estimatedHours, distanceKm, heroImage)
- Stop list timeline → `route-stops` (ordered, with location coords)
- Stop audio → `route-stops.audioGuide` → `audio-files`
- Geofence triggers → `route-stops.triggerRadiusMeters` + `location.latitude/longitude`
- Route map line → `routes.routePath` (GeoJSON LineString)
- Offline download → `routes.offlineAvailable` flag

---

#### MuseumGuide.tsx
**Data needs:**
- Museum by ID → `GET /api/museums/:id?depth=2`
- Exhibitions → `GET /api/museum-exhibits?where[museum][equals]=:id&sort=orderIndex`
- Virtual tour → `GET /api/virtual-tours?where[museum][equals]=:id&depth=1`

**Components → Collections:**
- Museum overview → `museums` (name, description, visitInfo, heroImage, gallery)
- Exhibition list → `museum-exhibits` (title, description, panelCount, duration, sensitivityLevel)
- On-Site Guide → `museum-exhibits` + `beacons` (panel navigation with BLE trigger)
- `PanoramaViewer` → `virtual-tours` + `panoramas` (hotspots, initialView)
- Etiquette → `museums.visitInfo` group field
- Exhibition Panels → `museum-exhibits` with `positionOnFloorPlan`

**Indoor Navigation Flow:**
1. User taps "On-Site Guide"
2. Mobile app starts BLE scanning via `react-native-ble-plx`
3. Beacon detected → look up `beacons.triggerExhibit`
4. Display exhibit content + audio from `museum-exhibits.audioGuide`
5. Position on floor plan from `beacons.positionOnPlan` × `floor-plans.planImage`

---

#### ExhibitionPanel.tsx
**Data needs:**
- Exhibitions list → `GET /api/museum-exhibits?where[museum][equals]=:id&where[exhibitType][equals]=room`
- Panel blocks → `GET /api/museum-exhibits?where[museum][equals]=:id&where[exhibitType][in]=panel,artifact`
- Panel content blocks (text, quote, video, audio, context) → `museum-exhibits.description` (Lexical rich text)

**Hooks to migrate:**
- `useExhibitions` → `fetch("/api/museum-exhibits?where[exhibitType][equals]=room&sort=orderIndex")`
- `useExhibitionPanels` → `fetch("/api/museum-exhibits?where[exhibitType][not_equals]=room&sort=orderIndex")`
- `usePanelBlocks` → derived from exhibit's rich text body (Lexical blocks)

---

#### TestimonyViewer.tsx / TestimoniesHub.tsx
**Data needs:**
- All testimonies → `GET /api/testimonies?where[consentStatus][not_equals]=withdrawn&depth=1`
- Single testimony by slug → `GET /api/testimonies?where[slug][equals]=:slug&depth=2`
- Audio testimony → `testimonies.audioTestimony` → `audio-files`

**Hooks to migrate:**
- `useTestimonies` → `fetch("/api/testimonies?limit=50&sort=-createdAt")`
- `useTestimony(slug)` → `fetch("/api/testimonies?where[slug][equals]=${slug}&depth=2&limit=1")`

**Components → Collections:**
- `TestimonyHero` → `testimonies` (title, survivorName, heroImage)
- `TestimonyModeSelector` → determines read/audio/video mode
- `TestimonyAudioPlayer` → `testimonies.audioTestimony` → `audio-files`
- `TestimonyVideoPlayer` → future video field
- `TestimonyReadMode` → `testimonies.body` (Lexical rich text)
- `ContentWarningBanner` → `testimonies.contentWarning` + `sensitivityLevel`
- `TestimonyFilters` → filter by `themes`, `location`, category
- `TestimonyCard` → list item with `survivorName`, `excerpt`, `themes`

**Consent enforcement:**
- Backend `access` function: NEVER serve testimonies where `consentStatus === "withdrawn"`
- Partial consent: only serve text OR audio based on `consentStatus` value

---

#### DocumentariesHub.tsx / DocumentaryPage.tsx
**Requires new collection: `documentaries`**

```typescript
// New collection needed — not in current CMS schema
export const Documentaries: CollectionConfig = {
  slug: "documentaries",
  fields: [
    { name: "title", type: "text", localized: true },
    { name: "slug", type: "text", unique: true },
    { name: "description", type: "richText", localized: true },
    { name: "heroImage", type: "upload", relationTo: "media" },
    { name: "videoUrl", type: "text" },
    { name: "durationMinutes", type: "number" },
    { name: "director", type: "text" },
    { name: "year", type: "number" },
    { name: "category", type: "select", options: ["survivor-stories","historical","cultural","educational"] },
    { name: "chapters", type: "array", fields: [...] },
    { name: "sensitivityLevel", type: "select", ... },
    { name: "accessLevel", type: "select", ... },
  ]
};
```

**Hooks to migrate:**
- `useDocumentaries` → `fetch("/api/documentaries")`
- `useDocumentary(slug)` → `fetch("/api/documentaries?where[slug][equals]=${slug}&depth=2")`
- `useDocumentaryChapters` → chapters array in documentary document

---

#### ThemesHub.tsx / ThemeDetail.tsx
**Data needs:**
- Themes → derived from `stories.category` enum (not a separate collection)
- Stories by theme → `GET /api/stories?where[category][equals]=:themeId`

**Implementation:**
- Theme list is static (derived from the category enum values)
- Theme detail page fetches stories filtered by that category
- No separate "themes" collection needed

---

#### MemorialsHub.tsx
**Data needs:**
- All museums/memorials → `GET /api/museums?sort=name&depth=1`
- Filter by type (genocide_memorial, museum, cultural_center)

**Components → Collections:**
- Museum cards → `museums` (name, shortDescription, heroImage, visitInfo, type)
- Location/hours → `museums.visitInfo.openingHours` + `museums.location` → `locations`

---

#### FullMap.tsx
**Data needs:**
- All location pins → `GET /api/locations?limit=200`
- GeoJSON features → `SELECT * FROM map_features_geojson` (PostGIS view)
- Story preview on pin tap → `GET /api/stories?where[location][equals]=:locationId&limit=1`

**Components → Collections:**
- `CinematicMapPin` → `locations` (latitude, longitude, mapIcon, locationType)
- `RouteHeatmap` → `routes.routePath` (GeoJSON LineString)
- `StoryPreviewSheet` → `stories` (linked from location)
- `LandscapeSpeaksMode` → ambient client-side feature
- `OnRoadNotification` → geofence triggers from `route-stops.triggerRadiusMeters`
- `NotificationQueue` / `NotificationBundle` → client-side notification system

**Map library:** Leaflet 1.9.4 + react-leaflet 5.0.0 (confirmed from package.json, NOT Mapbox)

---

#### LocationPage.tsx
**Data needs:**
- Location detail → `GET /api/locations?where[slug][equals]=:slug&depth=2`
- Related stories → `GET /api/stories?where[location][equals]=:locationId`
- Related museums → `GET /api/museums?where[location][equals]=:locationId`

**Components → Collections:**
- `LocationHero` → `locations` + `media` (then/now images)
- `ChooseYourPath` → journey mood selector (client-side UX)
- `ModeTemplate` → content filtered by mode (remembrance/culture/travel)
- `WeatherChip` → client-side weather API integration

---

#### AskRwandaPage.tsx (AI Chat)
**Data needs:**
- Send query → `POST /api/v1/ask-rwanda` (AI service)
- Stream response → SSE from AI service
- Context → museum, location, route, or story context passed via URL params
- Source references → AI response includes source IDs → link to stories/testimonies/exhibits
- Rate limiting → based on `users.accessTier` (free: 5/day, subscriber: 100/day)

**API contract (existing in ai-service):**
```typescript
POST /api/v1/ask-rwanda
{
  query: string,
  mode: "standard" | "personal_voices" | "kid_friendly",
  context?: { type: "museum"|"location"|"route"|"story", id: string },
  language?: "en" | "fr" | "rw",
  stream: boolean
}
// Response: SSE stream of { text, sources[], related_content[] }
```

**Hooks to migrate:**
- `useAskRwanda` → connects to AI service via SSE, manages message state
- Filter bar → sets query `mode` parameter
- Context chip → passes `context` object from URL/navigation state
- Source clicks → navigate to `/stories/:id`, `/testimonies/:id`, `/locations/:id`

---

### 2. ACCESS & PAYMENT PAGES

#### AccessOptionsPage.tsx
**Data needs:**
- Pricing → from `site-settings` global (monthlyPrice, annualPrice)
- Current access → `GET /api/users/me` (accessTier, active subscription)

**Payment flow:**
1. User selects plan → POST to Stripe (international) or Flutterwave (local)
2. Stripe/Flutterwave webhook → creates `subscriptions` + `payments` records
3. Payload updates `users.accessTier` to "subscriber"

**Components → Collections:**
- Subscription tiers → `site-settings.pricing`
- `AccessStatusWidget` → `users.accessTier` + `subscriptions.status`
- `TourGroupBadge` → `access-codes` redemption data

---

#### RedeemCodePage.tsx
**Data needs:**
- Validate code → `POST /api/access-codes/redeem` (custom endpoint)
- Code validation checks: exists, not expired, not maxed out, valid date range

**Custom Payload endpoint:**
```typescript
// POST /api/access-codes/redeem
{
  code: "KIGALI-TOUR-2026"
}
// Response: { success, accessLevel, expiresAt, agencyName }
```

---

#### AuthPage.tsx / ResetPasswordPage.tsx
**Data needs:**
- Sign up → `POST /api/users` (Payload auth)
- Sign in → `POST /api/users/login`
- Reset password → `POST /api/users/forgot-password` + `POST /api/users/reset-password`

**Hooks to migrate:**
- `useAuth` → wraps Payload auth endpoints, manages JWT in httpOnly cookie
- `signIn(email, password)` → `POST /api/users/login`
- `signUp(email, password)` → `POST /api/users`
- `signOut()` → `POST /api/users/logout`
- `isAdmin()` → checks `user.role === "admin"` from `/api/users/me`

---

#### Onboarding.tsx
**Data needs:**
- Save preferences → `PATCH /api/users/:id` (interests, language, showSensitive)

**Components:**
- `OnboardingInterests` → saves to `users` custom fields (needs interests array field)
- `OnboardingSafety` → saves `preferredLanguage`, sensitivity preferences
- `OnboardingDownload` → offline content pack download

---

#### ProfilePage.tsx
**Data needs:**
- User profile → `GET /api/users/me?depth=1`
- Subscription status → `GET /api/subscriptions?where[user][equals]=me`
- Tour group access → `GET /api/access-codes?where[redemptions.user][equals]=me`
- AI conversation history → `GET /api/ai-conversations?where[user][equals]=me&sort=-createdAt`

---

### 3. AGENCY PORTAL PAGES

#### agency/AgencyAuthPage.tsx
- Agency sign up → `POST /api/agencies` + `POST /api/users` (with role=agency_operator)
- Logo upload → `POST /api/media` (Payload upload)

#### agency/AgencyDashboard.tsx
- Agency stats → `GET /api/agencies/:id?depth=1`
- Active codes → `GET /api/access-codes?where[agency][equals]=:id&sort=-createdAt`
- Recent redemptions → aggregated from `access-codes.redemptions`

**Hooks to migrate:**
- `useAgency` → wraps agency API calls, provides `agency`, `codes`, `stats`

#### agency/AgencyGenerateCodes.tsx
- Generate code → `POST /api/access-codes` (with agency relation, codeType, maxUses, expiresAt)
- QR code generation → client-side via `html5-qrcode`

#### agency/AgencyCodesList.tsx
- All codes → `GET /api/access-codes?where[agency][equals]=:id`
- Delete code → `DELETE /api/access-codes/:id`
- Code stats → computed from `usedCount`, `maxUses`, `expiresAt`

#### agency/AgencyAnalytics.tsx
- Usage overview → custom endpoint aggregating code redemptions, content views
- `ActivationChart` → time-series of code activations
- `ContentBreakdown` → what content agency visitors access
- `GroupPerformance` → per-code redemption rates

#### agency/AgencyPricing.tsx
- Plans → needs `agency-pricing-plans` collection or embedded in `site-settings`
- `useAgencyPricingPlans` → `GET /api/agency-pricing-plans`

---

### 4. ADMIN PAGES

#### AdminDashboard.tsx
**Sections map:**
| Admin Section | Path | Backend |
|---|---|---|
| Content CMS | `/admin/content` | Payload Admin UI (built-in) |
| Map Control Panel | `/admin/map` | `locations` + `route-stops` |
| Museums & Memorials | `/admin/museums` | `museums` + `museum-exhibits` |
| Route Builder | `/admin/routes` | `routes` + `route-stops` |
| VR Tours | `/admin/vr` | `virtual-tours` + `panoramas` |
| Exhibitions | `/admin/exhibitions` | `museum-exhibits` |
| Testimonies | `/admin/testimonies` | `testimonies` |
| Documentaries | `/admin/documentaries` | `documentaries` |
| AI Config | `/admin/ai` | `ai-settings` global |
| Agency Management | `/admin/agencies` | `agencies` |

**Most admin CRUD is replaced by Payload Admin UI** at `/admin`. Custom admin pages only needed for:
- Map editor (visual pin placement on Leaflet map)
- Route builder (visual stop ordering with map)
- VR tour builder (panorama hotspot editor)
- AI config panel (tone profiles, safety rules)

---

#### AIAdmin.tsx
**Data needs:**
- AI settings → `GET /api/globals/ai-settings`
- AI audit logs → `GET /api/ai-conversations?sort=-createdAt&limit=100`
- Safety flags → `GET /api/ai-conversations?where[safetyFlagged][equals]=true`

**Panels → Globals/Collections:**
- `ToneProfilesPanel` → `ai-settings.askRwanda` (modes, default tone)
- `ModeConfigPanel` → `ai-settings.askRwanda` (standard/personal_voices/kid_friendly)
- `SafetySettingsPanel` → `ai-settings.safety` (pre/post filter, audit, human review)
- `SourceRulesPanel` → AI service config (which collections feed RAG)
- `ModelSettingsPanel` → AI service config (model selection, temperature)
- `AIPreviewPanel` → test chat against AI service
- `LocationOverridesPanel` → per-location AI behavior overrides
- `AILogsPanel` → `ai-conversations` audit log

---

#### MapControlPanel.tsx
**Data needs:**
- All locations → `GET /api/locations?limit=500`
- Route stops → `GET /api/route-stops?depth=1`
- Map settings → `GET /api/globals/site-settings` (mapbox/leaflet config)

**Components → Collections:**
- `MapEditor` → visual Leaflet editor, CRUD on `locations`
- `StopsManager` → CRUD on `route-stops` (with map placement)
- `LandmarksManager` → CRUD on `locations` filtered by type=landmark
- `MapSettingsPanel` → `site-settings.mapbox`

---

#### MuseumAdmin.tsx / MuseumBuilder.tsx
**Data needs:**
- Museum list → `GET /api/museums`
- Single museum → `GET /api/museums/:id?depth=2`
- Museum exhibits → `GET /api/museum-exhibits?where[museum][equals]=:id`
- Floor plans → `GET /api/floor-plans?where[museum][equals]=:id`
- Beacons → `GET /api/beacons?where[museum][equals]=:id`

**Hooks to migrate:**
- `useMuseums` → `fetch("/api/museums")`
- `useMuseum(id)` → `fetch("/api/museums/${id}?depth=2")`
- `useMuseumMutations` → POST/PATCH/DELETE on `/api/museums`

**Builder tabs → Collections:**
- Overview tab → `museums` core fields
- Rooms tab (`MuseumRoomsTab`) → `floor-plans.zones` + `museum-exhibits`
- Outdoor tab (`MuseumOutdoorTab`) → `locations` + `museums.gallery`
- Settings tab (`MuseumSettingsTab`) → `museums.visitInfo` + `museums.sensitivityLevel`
- Preview tab (`MuseumPreviewTab`) → renders museum as visitor would see it

---

#### VRAdmin.tsx
**Data needs:**
- Virtual tours → `GET /api/virtual-tours?where[museum][equals]=:museumId`
- Panoramas → `GET /api/panoramas?where[virtualTour][equals]=:tourId`
- Hotspot CRUD → PATCH on `panoramas.hotspots` array

**Components → Collections:**
- `VRAdminPanel` → manages `virtual-tours` (create/edit tours)
- Scene list → `panoramas` with thumbnails
- Hotspot editor → `panoramas.hotspots` (pitch, yaw, target, type)
- Tour preview → renders Pannellum with current panorama config

---

#### RouteAdmin.tsx / RouteBuilder.tsx
**Data needs:**
- Routes → `GET /api/routes`
- Route stops → `GET /api/route-stops?where[route][equals]=:id&sort=orderIndex`
- Locations for stop placement → `GET /api/locations`

**Hooks to migrate:**
- `useRouteAdmin` → CRUD on `/api/routes`
- `useRouteStops` → CRUD on `/api/route-stops`

**Builder features:**
- `RouteMap` → Leaflet map with draggable stop markers
- `StopList` → ordered list with drag-to-reorder (`@dnd-kit`)
- `StopEditor` → form for stop details, content linking, geofence radius

---

## Custom Payload Endpoints Needed

Beyond standard CRUD, these custom endpoints are required:

```typescript
// 1. Code Redemption
POST /api/access-codes/redeem
{ code: string } → { success, accessLevel, expiresAt, agencyName }

// 2. Nearby Content (PostGIS)
GET /api/locations/nearby?lat=-1.94&lng=29.87&radius=5000
→ locations within radius, sorted by distance

// 3. Map GeoJSON
GET /api/locations/geojson
→ Full FeatureCollection for map rendering

// 4. User Progress Sync
POST /api/user-progress/sync
{ contentId, contentType, progressSeconds, completed }

// 5. Stripe Webhook
POST /api/payments/stripe-webhook
→ Handles payment_intent.succeeded, subscription events

// 6. Flutterwave Webhook
POST /api/payments/flutterwave-webhook
→ Handles charge.completed events

// 7. Content Search (full-text + semantic)
GET /api/search?q=kigali+memorial&type=stories,testimonies
→ Combined pg_trgm + pgvector search

// 8. AI Ask Rwanda (proxied to AI service)
POST /api/ask-rwanda
→ Proxies to AI service with user context, rate limiting, audit logging
```

---

## Collections Gap Analysis

| Frontend Need | CMS Collection | Status |
|---|---|---|
| Stories | `stories` | ✅ Built |
| Testimonies | `testimonies` | ✅ Built |
| Museums | `museums` | ✅ Built |
| Museum Exhibits | `museum-exhibits` | ✅ Built |
| Routes | `routes` | ✅ Built |
| Route Stops | `route-stops` | ✅ Built |
| Locations | `locations` | ✅ Built |
| Media | `media` | ✅ Built |
| Audio Files | `audio-files` | ✅ Built |
| Users | `users` | ✅ Built |
| Agencies | `agencies` | ✅ Built |
| Access Codes | `access-codes` | ✅ Built |
| Subscriptions | `subscriptions` | ✅ Built |
| Payments | `payments` | ✅ Built |
| AI Conversations | `ai-conversations` | ✅ Built |
| Floor Plans | `floor-plans` | ✅ Built |
| Beacons | `beacons` | ✅ Built |
| Virtual Tours | `virtual-tours` | ✅ Built |
| Panoramas | `panoramas` | ✅ Built |
| AR Experiences | `ar-experiences` | ✅ Built |
| AR Anchors | `ar-anchors` | ✅ Built |
| **Documentaries** | `documentaries` | ❌ **MISSING — needs creation** |
| **Documentary Chapters** | embedded in documentaries | ❌ **MISSING** |
| **User Progress** | `user-progress` | ❌ **MISSING — needs creation** |
| **Agency Pricing Plans** | `agency-pricing-plans` | ❌ **MISSING — needs creation** |
| **Quotes** | `quotes` | ❌ **MISSING (ContentCMS has QuoteEditor)** |
| **People/Figures** | `people` | ❌ **MISSING (ContentCMS has PeopleManager)** |
| **Events** | `events` | ❌ **MISSING (ContentCMS has EventManager)** |

---

## Hooks Migration Checklist

| Lovable Hook | Current Backend | New Backend | Priority |
|---|---|---|---|
| `useAuth` | Supabase Auth | Payload Auth API | P0 |
| `useContentAccess` | Supabase queries | `/api/users/me` + subscriptions | P0 |
| `useAskRwanda` | Mock/Supabase | AI Service SSE | P0 |
| `useTestimonies` / `useTestimony` | Supabase | Payload REST `/api/testimonies` | P1 |
| `useExhibitions` / `useExhibitionPanels` | Supabase | `/api/museum-exhibits` | P1 |
| `useDocumentaries` / `useDocumentary` | Supabase | `/api/documentaries` | P1 |
| `useMuseums` / `useMuseum` | Supabase | `/api/museums` | P1 |
| `useMuseumMutations` | Supabase | Payload CRUD | P1 |
| `useRouteAdmin` / `useRouteStops` | Supabase | `/api/routes`, `/api/route-stops` | P1 |
| `useAgency` | Supabase | `/api/agencies` + `/api/access-codes` | P2 |
| `useAgencyPricingPlans` | Supabase | `/api/agency-pricing-plans` | P2 |
| `useProgressTracking` | localStorage | `/api/user-progress/sync` | P2 |

---

## Next Steps

1. **Create missing collections:** Documentaries, UserProgress, AgencyPricingPlans, Quotes, People, Events
2. **Build custom endpoints:** Code redemption, nearby search, GeoJSON, payment webhooks, search
3. **Create API client layer:** Replace `@/integrations/supabase/client` with `@/lib/api/client.ts`
4. **Migrate hooks one-by-one:** Start with `useAuth`, then `useContentAccess`, then content hooks
5. **Build payment integration:** Stripe + Flutterwave webhook handlers in Payload
6. **Connect AI service:** Wire `useAskRwanda` to the FastAPI SSE endpoint
7. **Test PostGIS queries:** Nearby locations, route rendering, geofencing
