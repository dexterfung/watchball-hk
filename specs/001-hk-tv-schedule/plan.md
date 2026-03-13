# Implementation Plan: 香港足球電視直播時間表

**Branch**: `001-hk-tv-schedule` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-hk-tv-schedule/spec.md`

## Summary

Build a public-facing football TV schedule page for Hong Kong viewers as a Progressive Web App. The page displays upcoming football matches broadcast on HK TV/OTT platforms, with filters for date, competition, and team. Built with Next.js App Router, data served from Supabase (Postgres), deployed to Vercel with edge caching in Hong Kong (hkg1). Pages are statically generated via ISR and revalidated on-demand when the admin (spec 002) pushes changes. Offline viewing is handled by a service worker caching the last-viewed schedule.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+
**Primary Dependencies**: Next.js 15 (App Router), @supabase/supabase-js, @supabase/ssr, Serwist (PWA/service worker)
**Storage**: Supabase Postgres (Singapore region, free tier — 500 MB, sufficient for schedule data)
**Testing**: Vitest (unit), Playwright (E2E — PWA install, offline, keyboard nav, mobile filters)
**Target Platform**: Web (PWA), Vercel (hkg1 edge region)
**Project Type**: Web application (PWA)
**Performance Goals**: <1s LCP on mid-range mobile over 4G; static HTML served from Vercel edge (hkg1)
**Constraints**: Offline-capable (service worker), Traditional Chinese primary, all times in HKT (UTC+8)
**Scale/Scope**: ~10–30 matches/day, ~50 competitions, ~500 teams, ~10 broadcasters; single public page with date/filter variations

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Schedule Correctness ✅

- **HKT handling**: All times stored as UTC in Supabase `timestamptz`. Displayed as HKT (UTC+8) in the UI using explicit timezone formatting. No device-locale-dependent display.
- **Record metadata**: Data model includes `source_type`, `last_updated`, and `confidence` fields on every match record (see data-model.md).
- **Display rules**: Matches with `confidence: unconfirmed` or `estimated` display a 待確認 badge. Staleness threshold is configurable; stale records are flagged.
- **Graceful fallbacks**: Matches with no broadcaster show a 待定 label; never hidden.
- **Ingestion monitoring**: Phase 1 is manual-only. Vercel build/deploy notifications are sufficient per constitution.
- **Corrections**: On-demand ISR revalidation. Admin triggers revalidation via API route; updated page is served from edge within seconds.

### II. Responsive Web-First UX ✅

- **Language**: Traditional Chinese primary throughout. English secondary labels on team/competition names where data exists.
- **Filters**: Date (day navigation), competition, and team filters. All usable on 375px screens without horizontal scrolling.
- **Viewports**: Responsive layout tested at 375px–1440px. Touch targets ≥44×44px.
- **Performance**: ISR pages served as static HTML from Vercel edge (hkg1). Target <1s LCP on 4G. Static assets (JS, CSS, fonts) via CDN.
- **PWA**: Serwist-based service worker for offline caching. Web app manifest for home screen install on iOS/Android.

### III. Simple, Maintainable Architecture ✅

- **Three-layer separation**:
  1. Data ingestion: Admin UI (spec 002) writes to Supabase. Not part of this spec.
  2. Data-serving: Next.js Server Components fetch from Supabase at ISR build time. API route for revalidation.
  3. UI: React Client Components render schedule, handle client-side filtering. No direct DB access.
- **Admin UI**: Defined in spec 002, not this spec. This plan only provides the revalidation endpoint the admin will call.
- **Database**: Supabase Postgres free tier (500 MB — more than sufficient for schedule data).
- **Deployment units**: 1 for this feature (frontend/PWA on Vercel). Database is Supabase-managed. Total: 2 units (within constitution limit).
- **Dependencies**: Each dependency justified in research.md.

### IV. Gradual Data Automation ✅

- Phase 1 ingestion is fully manual via admin UI (spec 002). No automation in this spec.
- Data model includes `source_type`, `last_updated`, `confidence` fields — ready for future automation.

### V. Incremental Feature Delivery ✅

- User stories are independently testable (P1 schedule view → P2 date nav → P3 filters → P4 offline → P5 PWA install).
- Each increment delivers user-visible value on its own.
- Feature 001 is fully deployable without feature 002 (can seed data directly in Supabase for testing).

## Project Structure

### Documentation (this feature)

```text
specs/001-hk-tv-schedule/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           # API contract (revalidation endpoint)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx              # Root layout (metadata, fonts, PWA manifest link)
│   ├── page.tsx                # Schedule page (Server Component, ISR)
│   ├── manifest.ts             # PWA web app manifest
│   └── api/
│       └── revalidate/
│           └── route.ts        # On-demand ISR revalidation endpoint
├── components/
│   └── schedule/
│       ├── MatchList.tsx        # Client Component — match list with filtering
│       ├── MatchCard.tsx        # Single match entry display
│       ├── DateNavigator.tsx    # Day forward/backward navigation
│       ├── FilterBar.tsx        # Competition + team filter controls
│       ├── ConfidenceBadge.tsx  # 待確認 badge component
│       ├── EmptyState.tsx       # No matches / no results message
│       └── OfflineBanner.tsx    # Offline indicator banner
├── lib/
│   ├── supabase/
│   │   ├── server.ts           # Supabase client for Server Components
│   │   └── types.ts            # Generated database types
│   ├── schedule.ts             # Schedule data fetching functions
│   ├── date.ts                 # HKT date formatting utilities
│   └── types.ts                # Shared TypeScript types
├── sw.ts                       # Serwist service worker source
└── public/
    ├── icons/                  # PWA icons (192x192, 512x512)
    └── sw.js                   # Compiled service worker (build output)

supabase/
└── migrations/
    └── 001_initial_schema.sql  # Database schema migration

tests/
├── unit/                       # Vitest unit tests
│   ├── date.test.ts            # HKT formatting tests
│   └── schedule.test.ts        # Data fetching/filtering tests
└── e2e/                        # Playwright E2E tests
    ├── schedule.spec.ts        # Schedule display, date nav, filters
    ├── offline.spec.ts         # Offline caching behavior
    └── pwa.spec.ts             # PWA installability
```

**Structure Decision**: Single Next.js App Router project. The schedule page is the root page (`/`). Date is passed as a search parameter (`?date=2026-03-13`), defaulting to today (HKT). This keeps routing simple — one page component handles all dates. Filtering (competition/team) is client-side within the statically rendered page. The admin UI (spec 002) will be added later as route group `(admin)/` within the same Next.js app.

## Rendering & Caching Strategy

### Static Generation with On-Demand Revalidation (ISR)

1. **Build time**: The schedule page is rendered as a Server Component. It fetches all matches for the requested date from Supabase, including related team/competition/broadcaster data.
2. **Edge caching**: Vercel caches the rendered HTML at the hkg1 edge. Subsequent requests are served from cache with no Supabase round-trip.
3. **Revalidation**: When the admin (spec 002) creates/edits/deletes a match, it calls `POST /api/revalidate` with a secret token. This triggers `revalidatePath('/')` to regenerate the page.
4. **Staleness**: If revalidation fails (e.g., Supabase temporarily unavailable), Vercel serves the stale cached page. Users see slightly outdated data rather than an error.

### Client-Side Filtering

- The Server Component fetches ALL matches for the selected date (typically 10–30 matches) and passes them as props to a Client Component.
- Competition and team filtering happens entirely client-side via React state. No additional data fetches needed.
- Date navigation triggers a full page navigation (new URL → hits edge cache or triggers ISR).

### Offline Strategy (Serwist)

- **Precache**: App shell (HTML, CSS, JS, fonts, icons).
- **Runtime cache**: NetworkFirst strategy for the schedule page — try network, fall back to cache. This ensures the last successfully loaded schedule is always available offline.
- **Offline indicator**: When `navigator.onLine` is false (or network fetch fails), show 離線模式 banner.

## Complexity Tracking

No violations. All architecture decisions align with the constitution's limits.

| Decision | Justification |
|----------|---------------|
| Serwist for PWA | Successor to next-pwa, actively maintained, purpose-built for Next.js App Router |
| Client-side filtering | Data volume per day is small (10–30 matches); avoids extra API calls and keeps pages fully static |
| Search params for date | Simpler than dynamic route segments; works naturally with ISR caching on Vercel |
