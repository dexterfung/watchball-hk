# Research: 001-hk-tv-schedule

**Date**: 2026-03-13

## R1: Next.js PWA Library

**Decision**: Serwist (@serwist/next) for service worker / offline caching; Next.js built-in `manifest.ts` for PWA manifest
**Rationale**: Next.js App Router has built-in support for PWA manifests via metadata files (`manifest.ts` in the `app/` directory) and Apple-specific meta tags in the root layout — no library needed for installability. Serwist is needed specifically for the service worker: precaching the app shell, runtime caching strategies (NetworkFirst for schedule pages), and offline fallback. It wraps Google Workbox with Next.js-aware defaults.
**Alternatives considered**:
- `next-pwa`: Deprecated, no longer maintained. Designed for Pages Router, not App Router.
- Manual service worker (no library): More control but significantly more boilerplate for standard features (precaching, cache strategies, offline fallback). Not justified for this use case.
- Next.js built-in only (no Serwist): Sufficient for manifest and installability, but does not provide service worker runtime caching needed for the offline schedule requirement (FR-015).
**Note**: Serwist requires Webpack bundler. If the project uses Next.js 16+ (Turbopack default), the build script must include `--webpack` flag.

## R2: Offline Caching Strategy

**Decision**: NetworkFirst for schedule pages, CacheFirst for static assets
**Rationale**: NetworkFirst ensures users see fresh data when online, but falls back to cached content when offline. CacheFirst for static assets (JS, CSS, fonts, icons) maximises performance since these change only on deploys. The precache manifest covers the app shell for instant offline rendering.
**Alternatives considered**:
- StaleWhileRevalidate: Shows cached content immediately and updates in background. Risk: user sees stale schedule data without realising it's outdated. Conflicts with constitution Principle I (schedule correctness).
- CacheOnly: Too aggressive — users would never see updates without clearing cache.
**Offline indicator**: When the service worker serves from cache (network unavailable), set a flag that the UI reads to show the 離線模式 banner. Use `navigator.onLine` event plus service worker message passing.

## R3: Supabase + Next.js Server Components

**Decision**: Use `@supabase/supabase-js` with `@supabase/ssr` for server-side data fetching in Server Components
**Rationale**: `@supabase/ssr` provides cookie-based auth helpers designed for Next.js App Router. For this feature (public, no auth), a simple `createClient()` from `@supabase/supabase-js` using the anon key is sufficient for Server Component data fetching. The `@supabase/ssr` package will be needed when spec 002 (admin auth) is implemented.
**Alternatives considered**:
- Direct Postgres connection (e.g., `pg` or Drizzle ORM): More control but loses Supabase's generated types, auth integration, and real-time features. Adds unnecessary complexity for Phase 1.
- Supabase Edge Functions: Overkill — Server Components can fetch directly.

## R4: ISR and On-Demand Revalidation

**Decision**: Use Next.js ISR with `revalidatePath` triggered by a protected API route
**Rationale**: Schedule data changes 1–2 times per week. ISR generates static HTML at first request, caches it at the edge, and serves it for all subsequent users. When the admin edits data (spec 002), it calls `POST /api/revalidate?secret=<token>` which calls `revalidatePath('/')` to rebuild. This gives sub-100ms page loads from edge cache with near-instant updates when needed.
**Alternatives considered**:
- Time-based revalidation (`revalidate: 3600`): Too slow for corrections — users could see wrong broadcaster info for up to an hour. Conflicts with Principle I.
- Full SSR (no caching): Unnecessary server compute for data that rarely changes. Slower first load. Doesn't meet <1s LCP target as reliably.
- `revalidateTag` instead of `revalidatePath`: More granular but adds tag management complexity. Since there's only one page (with date param), `revalidatePath` is sufficient.

## R5: Date Handling (HKT)

**Decision**: Store as UTC `timestamptz` in Supabase. Format as HKT in the UI using `Intl.DateTimeFormat` with `timeZone: 'Asia/Hong_Kong'`.
**Rationale**: UTC storage is the constitutional requirement. `Intl.DateTimeFormat` is built into all modern browsers with no library dependency. Hong Kong does not observe DST, so UTC+8 is constant year-round — no edge cases.
**Alternatives considered**:
- `date-fns-tz` or `dayjs` with timezone plugin: Adds a dependency for something the platform API handles natively. Not justified.
- Store as HKT: Violates constitution Principle I ("stored in UTC internally"). Causes issues if future features need timezone-aware queries.

## R6: Supabase Free Tier Viability

**Decision**: Supabase free tier is sufficient for Phase 1
**Rationale**: Free tier provides 500 MB database storage and 2 GB egress. Schedule data is tiny — ~30 matches/day × 37 days browsable = ~1,100 rows with related reference data. Total data volume well under 10 MB. Egress is minimal since ISR means Supabase is only hit during revalidation (1–2 times/week), not on every user page load.
**Risk**: Free tier projects pause after 7 days of inactivity. Mitigation: The operator accesses the admin 1–2 times/week, which keeps the project active. Additionally, ISR serves stale cached pages if Supabase is temporarily unavailable, so a paused DB doesn't cause immediate user-facing errors.
**Upgrade trigger**: If the project needs 24/7 uptime guarantees or the DB grows beyond 500 MB, upgrade to Supabase Pro ($25/mo).

## R7: Rendering Strategy for Filters

**Decision**: Server-side fetch all matches for the date; client-side filtering via React state
**Rationale**: A single day's schedule contains ~10–30 matches — small enough to send entirely to the client. Client-side filtering is instant (no network round-trip), works offline, and keeps the page fully static. Competition and team filter options are derived from the fetched matches for that date.
**Alternatives considered**:
- Server-side filtering via search params: Each filter combination would be a separate ISR page. Combinatorial explosion (date × competition × team) makes this impractical and wastes edge cache.
- API route for filtered results: Adds latency, requires client-side loading states, doesn't work offline. Over-engineered for 10–30 items.
