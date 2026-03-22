# 🇷🇼 Muraho Rwanda

**Self-hosted, AI-powered digital heritage platform for Rwanda.**

Muraho Rwanda is a 9-module cultural tourism platform that brings Rwanda's history, memorials, and stories to life through interactive storytelling, AI-guided museum experiences, walking routes, and survivor testimonies — all with full data sovereignty.

> 485 files · 74,000+ lines · Zero external AI dependencies

---

## Architecture

```
muraho-rwanda/
├── frontend/        React 18 + Vite + Tailwind — 51 pages, 226 components
├── cms/             Payload CMS 3.0 + Next.js — 12 collections, 15 endpoints
├── ai-service/      FastAPI — RAG pipeline, LLM, embeddings, TTS, transcription
├── mobile/          React Native (Expo) — 6 screens, Mapbox, offline support
├── shared/          Shared TypeScript types between web and mobile
├── infra/           Docker Compose (9 services), nginx, SSL, scripts
├── tests/           Integration tests (Python + TypeScript)
└── .github/         CI/CD pipelines
```

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind, Shadcn/ui | PWA with offline support |
| **Mobile** | React Native, Expo, NativeWind | Shared types with web |
| **CMS** | Payload CMS 3.0 (Next.js embedded) | 12 collections, role-based access |
| **AI Service** | FastAPI, vLLM/Ollama, pgvector | RAG + multilingual |
| **LLM** | Mistral 7B / Mixtral 8×7B | Self-hosted, no data leaves infra |
| **Embeddings** | multilingual-e5-large | Kinyarwanda + French + English |
| **Transcription** | Faster-Whisper large-v3 | Self-hosted GPU |
| **Database** | PostgreSQL 16 + pgvector + PostGIS | Spatial queries + vector search |
| **Cache** | Redis 7 | Rate limiting + sessions |
| **Storage** | MinIO (S3-compatible) | Media, audio, documents |
| **Maps** | Mapbox GL JS / @rnmapbox/maps | Routes, POIs, spatial layers |
| **Payments** | Stripe (international) + Flutterwave (MTN MoMo/Airtel) | Dual gateway |
| **Proxy** | Nginx + Let's Encrypt | SSL, rate limiting, security headers |

## Quick Start (Development)

```bash
# 1. Clone and configure
git clone <repo-url> && cd muraho-rwanda
cp infra/docker/.env.example infra/docker/.env
# Edit .env with your credentials

# 2. Start all services
cd infra/docker
docker compose up -d
# Services: PostgreSQL, Redis, MinIO, Ollama, Payload CMS, AI Service, Frontend

# 3. Wait for Ollama to download models (first run: 5-10 min)
docker compose logs -f ollama

# 4. Seed initial content
docker exec -it muraho-rwanda-payload-1 npm run seed
# Creates: 6 museums, 10 locations, 3 routes, 5 stories, AI config

# 5. Access
# Frontend:   http://localhost:5173
# CMS Admin:  http://localhost:3000/admin
# AI Service: http://localhost:8000/docs
# MinIO:      http://localhost:9001
# Admin login: admin@muraho.rw / MurahoAdmin2026!
```

## Production Deployment

```bash
# 1. Configure production environment
cp infra/docker/.env.example infra/docker/.env
# Set real passwords, API keys, domain

# 2. Get SSL certificate
cd infra/docker
docker compose --profile production run certbot \
  certonly --webroot -w /var/www/certbot \
  -d muraho.rw -d www.muraho.rw

# 3. Start with nginx + SSL
docker compose --profile production up -d

# 4. Seed database
docker compose exec payload npm run seed

# 5. Verify
curl -sf https://muraho.rw/api/health
```

**GPU server (for vLLM production inference):**

```bash
# Use production compose with vLLM instead of Ollama
docker compose -f docker-compose.prod.yml up -d
# Requires: NVIDIA GPU, nvidia-docker2 runtime
```

## Services

### Frontend (51 pages)

Public pages: Home, Map, Stories, Testimonies, Documentaries, Memorials, Routes, Museum Guide, Ask Rwanda (AI chat), Search Results, Onboarding, Auth, Access Options, Redeem Code, Payment Success/Cancel

Admin pages: Dashboard (live stats), Content CMS, Map Control Panel, Museum Admin, Route Admin, Exhibition Admin, Story Admin, Testimony Admin, Documentary Admin, VR Admin, AI Admin, Agency Admin, System Monitoring

User pages: Profile, Settings

### CMS (12 collections, 15 endpoints)

Collections: Users, Stories (with story blocks), Museums, Museum Exhibits, Locations, Routes (with stops + GeoJSON paths), Testimonies, Documentaries (with chapters), Themes, VR Experiences, AI Conversations, Access Codes, Subscriptions, Agency Purchases, User Content Access, User Progress

Custom endpoints: `/api/health`, `/api/spatial/nearby`, `/api/spatial/bbox`, `/api/spatial/layers`, `/api/spatial/route-path`, `/api/ask-rwanda` (SSE streaming), `/api/search`, `/api/payments/create-checkout`, `/api/webhooks/stripe`, `/api/webhooks/flutterwave`

### AI Service (6 route modules)

- **Ask Rwanda** (`/api/v1/ask`) — RAG-powered Q&A with 3 modes: standard, personal voices, kid-friendly. Sensitivity-aware safety layer for genocide-related content.
- **Embeddings** (`/api/v1/embed`, `/api/v1/index-content`) — Generate and store embeddings in pgvector. Auto-triggered by CMS publish hooks. 2000-char chunks with 200-char overlap.
- **TTS** (`/api/v1/tts`) — Text-to-speech with ElevenLabs fallback to self-hosted.
- **Transcription** (`/api/v1/transcribe`) — Faster-Whisper for audio/video transcription.
- **Search** (`/api/v1/search`) — Semantic vector search across all embedded content.
- **Health** (`/health`) — Service + model readiness checks.

### Mobile App (6 screens)

Built with Expo + React Native, sharing types with the web frontend:

- **Home** — Featured stories, nearby locations (GPS), museum highlights
- **Map** — Full Mapbox GL with live spatial data, route lines, POI markers
- **Ask** — AI chat interface with standard/kid-friendly modes
- **Stories** — Infinite-scroll story list with cover images
- **Story Detail** — Block-based reader with audio narration (Expo AV)
- **Profile** — Auth, access tier display, offline downloads, settings

### Security

- **Auth**: JWT with automatic 10-minute token refresh, tab focus + network reconnect triggers
- **Route protection**: Role-based guards (visitor, content_creator, agency_operator, admin)
- **Rate limiting**: Redis-backed (memory fallback), tiered by endpoint type and user role
- **Error handling**: Global ErrorBoundary with retry, network error detection
- **Headers**: HSTS, CSP, X-Content-Type-Options, X-Frame-Options (nginx)
- **SSL**: TLS 1.2+1.3, Mozilla Modern cipher suite, OCSP stapling
- **Payments**: Stripe webhook signature verification, Flutterwave hash validation

### Offline Support

- Service worker with multi-strategy caching (cache-first for media, network-first for API)
- Explicit content download via `useOffline` hook — caches all media for a museum/story
- Offline manifest tracking what's cached
- Graceful fallback page when fully offline
- PWA manifest with install prompt, app shortcuts (Map, Ask, Stories)

### Monitoring & Logging

- **System health**: `/api/health` endpoint checks all 5 services (Postgres, Redis, MinIO, AI, Ollama) with latency and status reporting
- **Admin dashboard**: Real-time monitoring at `/admin/monitoring` with service cards, latency bars, and content growth stats
- **Structured logging**: JSON-formatted request logs (method, path, status, duration, userId, IP). Configurable log levels via `LOG_LEVEL` env var
- **Audit logging**: All create/update/delete operations logged with userId, changed fields, and timestamps
- **Performance logging**: Automatic slow-request warnings (>5s)
- **Error tracking**: Stack traces captured with request context

## Content Migration

Bulk import from CSV or JSON files:

```bash
cd cms

# Dry run (preview what would be imported)
npx ts-node --esm migrate/index.ts --type museums --file data/museums.json --dry-run

# Import for real
npx ts-node --esm migrate/index.ts --type stories --file data/stories.csv

# Supported types: museums, locations, stories, testimonies, documentaries, routes
```

## Testing

```bash
# API integration tests (requires running stack)
cd tests && pip install -r requirements.txt
pytest api/ -v

# Frontend hook tests
cd frontend && npx vitest tests/hooks/ --run

# Full test suite
npm run test          # frontend unit tests
pytest tests/api/ -v  # backend integration tests
```

## CI/CD

GitHub Actions pipelines in `.github/workflows/`:

- **ci.yml** — Runs on every push/PR: frontend lint + type-check + build, CMS type-check + build, AI service lint + tests, Docker image builds (main only)
- **deploy.yml** — Auto-deploys to production via SSH after CI passes on main

## Environment Variables

All variables documented in `infra/docker/.env.example`. Key groups:

- **Database**: `POSTGRES_USER`, `POSTGRES_PASSWORD`
- **CMS**: `PAYLOAD_SECRET`
- **Storage**: `MINIO_ROOT_USER`, `MINIO_ROOT_PASSWORD`
- **Payments**: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FLUTTERWAVE_SECRET_KEY`
- **AI**: `OLLAMA_BASE_URL`, `VLLM_BASE_URL`, `EMBEDDING_MODEL`, `LLM_MODEL`
- **Frontend**: `VITE_API_URL`, `VITE_MAPBOX_TOKEN`

## Mobile Development

```bash
cd mobile
npm install

# Development
npx expo start

# Build
eas build --platform android --profile preview
eas build --platform ios --profile preview

# Production build
eas build --platform android --profile production
```

Requires: Expo account, EAS CLI, Mapbox secret token in `app.json`.

## Data Sovereignty

All AI processing runs on-premises. No user queries, content data, or embeddings leave the infrastructure. Audit logs are stored locally. The platform is designed for full compliance with Rwanda's data protection requirements.

## Project Structure Detail

```
frontend/src/
├── components/     226 components (ui, layout, map, story, admin, access, vr)
├── hooks/          25 custom hooks (auth, search, map, offline, content access)
├── pages/          51 page components (44 web + 7 admin)
├── lib/            API client, i18n, utilities
└── types/          Route definitions

frontend/public/
├── sw.js           Service worker (cache strategies, offline support)
├── manifest.json   PWA manifest (installable, shortcuts)
└── offline.html    Offline fallback page

cms/
├── collections/    12 collection configs with field definitions
├── endpoints/      15 custom API endpoints
├── hooks/          CMS lifecycle hooks (auto-embed on publish)
├── middleware/     Rate limiting + structured logging
├── access/         Shared role-based access control
├── fields/         Custom field types (location picker, sensitivity)
├── migrate/        Bulk import tool (CSV/JSON to Payload) + sample data
└── seed/           Initial data seeder

ai-service/app/
├── api/routes/     6 route modules (ask, embed, tts, transcribe, search, health)
├── services/       RAG pipeline, LLM router, embedding service
├── prompts/        System prompts, safety rules, tone profiles
├── models/         Pydantic schemas
└── core/           Config, security, logging

mobile/src/
├── screens/        6 screens (Home, Map, Ask, Stories, StoryDetail, Profile)
├── hooks/          Auth store (Zustand)
├── lib/            API client (expo-secure-store tokens)
└── navigation/     Tab layout (5 tabs)

shared/
└── types.ts        Shared TypeScript types (249 lines, web + mobile)

infra/
├── docker/         3 compose files (dev, main, prod) + .env.example + init scripts
└── nginx/          Production nginx config (SSL, security headers, rate limits)
```

## License

Proprietary. All rights reserved.
