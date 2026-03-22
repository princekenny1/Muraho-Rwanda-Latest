# Frontend Feature Status Tracker

Last updated: 2026-02-25

## Overall Status

- Route smoke test (Playwright, authenticated + public): **28/28 routes OK**
- Frontend production build: **PASS** (`npm run build`)
- Theme switching: **PASS** (light/dark class toggles correctly)
- Media upload feedback: **PASS** (success/error toast indicators added)

## Feature Inventory & Current Status

| Feature Area                                                                 | Status                          | Verification                                               |
| ---------------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------- |
| Authentication (sign in, sign out, session)                                  | ✅ Working                      | Browser/API validation in current environment              |
| Public browsing (home, themes, map, stories hubs)                            | ✅ Working                      | Route smoke checks passed                                  |
| Profile & settings pages                                                     | ✅ Working                      | Authenticated route smoke checks passed                    |
| Theme changer (header/settings)                                              | ✅ Working                      | Browser check confirms `html` class toggles `light`/`dark` |
| Media upload (story/testimony/admin components)                              | ✅ Working                      | Upload UI shows progress + success/failure message         |
| Admin dashboard modules (content, AI, routes, museums, agencies, monitoring) | ✅ Working                      | Admin route smoke checks passed                            |
| VR admin panel                                                               | ✅ Working                      | `/admin/vr` no longer returns runtime/network errors       |
| Agency auth page                                                             | ✅ Working                      | Route smoke checks passed                                  |
| Payments success/cancel routes                                               | ⚪ Not smoke-tested in this run | Requires payment callback flow to validate end-to-end      |
| Dynamic detail routes (`/stories/:slug`, `/documentaries/:slug`, etc.)       | ⚪ Not smoke-tested in this run | Need fixture-specific E2E scenarios                        |

## Fixes Applied In This Validation Pass

1. Added global `ThemeProvider` mounting so `next-themes` works reliably.
2. Added explicit media upload success/error toasts in shared uploader used by CMS editors.
3. Removed duplicate-key and invalid DOM nesting warnings that were surfacing on map/home/documentaries pages.
4. Refactored VR hooks (`useVRScenes`, `useVRAdmin`) to match current Payload collections (`vr-scenes`, `vr-hotspots`).
5. Updated VR admin museum selection to use real museum IDs from backend instead of hardcoded slugs.

## Known Baseline (Not Introduced by This Pass)

- `npm test` currently has failing tests in existing suites (e.g. `StoryViewer`/`Transcript`) that are not tied to this feature activation pass.
- These test failures should be handled in a dedicated test stabilization pass.
