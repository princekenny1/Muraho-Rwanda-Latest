# Muraho Hosted Production Validation

Date: 2026-03-28
Target host: http://152.42.136.241
Tester: GitHub Copilot (GPT-5.3-Codex)

## Scope

- Hosted CMS/admin checks on port 3000
- Hosted frontend checks on port 5173
- Live API CRUD and custom endpoint checks
- Media upload + avatar assignment
- Subscription/payment data path checks
- At least one row per admin collection page

## Hosted CMS/Admin (3000)

Result: PASS

- Verified authenticated navigation across 43 admin collection/global pages.
- Every checked page returned HTTP 200 and rendered expected page title/h1.
- Added at least one data row for each admin collection page in the matrix.

## Hosted Frontend (5173)

Result: PARTIAL PASS

- Public routes loaded with HTTP 200:
  - /, /home, /themes, /memorials, /routes, /map, /onboarding
  - /ask, /testimonies, /documentaries, /exhibition
  - /reset-password, /redeem, /access, /ask-rwanda, /search
  - /payment/success, /payment/cancel, /agency/auth
- Admin app routes loaded with HTTP 200:
  - /admin, /admin/vr, /admin/testimonies, /admin/documentaries
  - /admin/exhibitions, /admin/agencies, /admin/ai, /admin/content
  - /admin/map, /admin/monitoring, /admin/museums, /admin/routes

## Data-Creation Validation (Hosted API)

Result: PASS

Created and verified live records across major collections:

- theme id=1
- person id=1
- location id=2
- historical-event id=1
- story id=1
- story-block id=1
- quote id=1
- content-tag id=1
- museum id=3
- museum-exhibit id=1
- museum-room id=1
- museum-panel id=1
- museum-outdoor-stop id=2
- vr-scene id=1
- vr-hotspot id=1
- route id=2
- route-stop id=1
- stop-content-block id=1
- route-version id=1
- route-comment id=1
- documentary id=1
- documentary-clip id=1
- testimony id=1
- sponsor id=2
- content-access id=1
- tour-agency id=1
- agency-pricing-plan id=1
- agency-purchase id=1
- access-code id=1
- user id=5
- user-content-access id=1
- code-redemption id=1
- subscription id=3
- payment id=3
- user-settings id=1
- user-saved-item id=1
- user-progress id=1
- user-download id=1
- analytics-event id=2
- analytics-daily id=1
- content-embedding id=1

## Media/Avatar Validation

Result: PASS

- Uploaded image media id=1 via multipart to /api/media
- Created user id=4
- Assigned avatar media id=1 to user id=4
- Verified avatar assignment via GET /api/users/4
- Uploaded audio file id=1 via multipart to /api/audio-files

## Custom Endpoint Validation (Hosted)

Result: MIXED

Pass:

- GET /api/health => 200
- POST /api/spatial/nearby => 200
- POST /api/spatial/bbox => 200
- POST /api/spatial/layers => 200
- GET /api/search?q=qa => 200
- POST /api/webhooks/stripe (invalid signature) => 400 (expected reject)

Fail:

- POST /api/ask-rwanda => 404
- POST /api/payments/create-checkout => 404
- POST /api/access-codes/redeem => 404

Note:

- POST /api/webhooks/flutterwave with invalid hash returned 200 in this environment.
  This is potentially unsafe if FLUTTERWAVE_WEBHOOK_HASH is not set in production.

## Functional Findings (Production Blockers)

1. Missing hosted custom endpoints
   - /api/ask-rwanda, /api/payments/create-checkout, /api/access-codes/redeem return 404.
   - These are listed in source endpoint registry but are not available on hosted deployment.

2. Dynamic content route mismatch in frontend
   - Seeded slugs exist in CMS, but several frontend slug pages still render fallback/not-found-style content.
   - Examples observed during test: story/testimony/museum-guide pages did not resolve seeded slugs as expected.

3. Query serialization bug symptoms in frontend network requests
   - Observed requests containing where[and]=[object Object],[object Object] pattern during page activity.
   - Indicates malformed query serialization for array-based where clauses, causing unreliable data retrieval.

4. QA user login from seeded API user failed with 401
   - Admin-created users in this run were not usable for direct frontend/user login validation.
   - Requires follow-up on user creation/auth flow expectations for production smoke users.

## Final Readiness Status

- CMS/Admin data operations: READY
- Frontend route availability: MOSTLY READY
- Core monetization and code redemption API paths: NOT READY (missing endpoints)
- Full production readiness: NOT READY until endpoint 404 issues and dynamic data fetch issues are resolved.
