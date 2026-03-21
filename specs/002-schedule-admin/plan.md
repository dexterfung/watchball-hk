# Implementation Plan: 賽程管理後台

**Branch**: `002-schedule-admin` | **Date**: 2026-03-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-schedule-admin/spec.md`

## Summary

Build a protected admin interface for the sole operator to create, edit, delete, and manage football match schedule entries. The admin is a set of Next.js App Router pages within the same project as the public schedule (spec 001), protected by Supabase Auth via middleware. The form is optimised for fast keyboard-driven data entry with searchable combobox dropdowns, copy-forward for recurring fixtures, and one-click cache invalidation that triggers the public site's ISR revalidation endpoint (defined in spec 001).

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20+
**Primary Dependencies**: Next.js 15 (App Router), @supabase/supabase-js, @supabase/ssr, Headless UI (@headlessui/react) for combobox/listbox, React Hook Form for form state/validation
**Storage**: Supabase Postgres (Singapore region, free tier) — same database as spec 001
**Testing**: Vitest (unit — form logic, date conversion), Playwright (E2E — keyboard navigation, CRUD flow, auth protection)
**Target Platform**: Web (desktop-first), Vercel (hkg1 region)
**Project Type**: Web application (admin panel within existing Next.js app)
**Performance Goals**: Form submission <500ms; cache invalidation propagation <30s to public site
**Constraints**: Single operator (no multi-user), desktop-first, keyboard-navigable, English UI
**Scale/Scope**: ~5–10 match entries per session, 1–2 sessions per week; ~50 competitions, ~500 teams, ~10 broadcasters in reference data

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Schedule Correctness ✅

- **HKT handling**: Admin form accepts kick-off time in HKT. Converted to UTC before writing to `kick_off_utc` (timestamptz) in Supabase. Uses `Asia/Hong_Kong` timezone for conversion.
- **Record metadata**: Every create/edit sets `source_type` (default: 'manual'), `last_updated` (auto: now()), and `confidence` (operator-selected: confirmed/unconfirmed/estimated).
- **Display rules**: Confidence field is a required dropdown with exactly 3 options. Operator explicitly chooses the confidence level for each record.
- **Graceful fallbacks**: Broadcaster field allows empty selection — record saves without broadcaster; public site shows fallback label (per spec 001).
- **Ingestion monitoring**: Phase 1 is manual-only. Vercel build/deploy notifications suffice.
- **Corrections**: After edit, operator triggers cache invalidation → calls POST /api/revalidate → public site updates within 30 seconds.

### II. Responsive Web-First UX ✅ (with justified scope)

- **Language**: Admin UI is in English (spec assumption — sole operator is the developer). Traditional Chinese is not required in the admin.
- **Viewports**: Desktop-first. Admin is not required to be mobile-optimised (spec assumption).
- **Performance**: Not a public-facing page — no <1s LCP requirement. Form submission should be responsive (<500ms).

### III. Simple, Maintainable Architecture ✅

- **Three-layer separation**:
  1. Data ingestion: Admin UI writes to Supabase via server actions or direct client mutations. This IS the ingestion layer.
  2. Data-serving: Not modified by this spec — spec 001's ISR setup reads from the same database.
  3. UI: Admin React components. No direct coupling to the public schedule UI.
- **Admin UI**: Custom-built with keyboard-navigable forms, pre-populated dropdowns, copy-forward, bulk entry. All constitutional requirements met.
- **Database**: Same Supabase Postgres instance as spec 001. No separate data store.
- **Deployment units**: Admin is part of the same Next.js app — no additional deployment unit. Still 2 total (frontend on Vercel + Supabase).
- **Dependencies**: Headless UI (combobox/keyboard nav) and React Hook Form (validation) — both justified in research.md.

### IV. Gradual Data Automation ✅

- Admin UI is the Phase 1 manual ingestion tool. All records set `source_type: 'manual'`.
- Data model supports future automation sources — `source_type` enum includes 'scraper', 'api', 'import'.
- Admin UI serves as the manual override fallback if automation is added later.

### V. Incremental Feature Delivery ✅

- User stories are independently testable: P1 (create) → P2 (copy-forward) → P3 (edit + invalidation) → P4 (delete) → P5 (reference data).
- P1 alone delivers a working admin that can populate the public schedule.
- Admin can be deployed independently — the public schedule works with any data in the database, whether entered via admin or seeded directly.

## Project Structure

### Documentation (this feature)

```text
specs/002-schedule-admin/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (references 001 schema, adds RLS)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── admin-api.md     # Admin mutation contracts
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (public)/                    # Route group for public pages (spec 001)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── (admin)/                     # Route group for admin pages
│   │   ├── layout.tsx               # Admin layout (auth check, nav)
│   │   ├── admin/
│   │   │   ├── page.tsx             # Match list + entry form (main admin page)
│   │   │   ├── login/
│   │   │   │   └── page.tsx         # Login page (Supabase Auth)
│   │   │   └── reference/
│   │   │       └── page.tsx         # Reference data management (competitions, teams, broadcasters)
│   │   └── actions/
│   │       ├── matches.ts           # Server actions: create, update, delete match
│   │       ├── reference.ts         # Server actions: manage reference data
│   │       └── revalidate.ts        # Server action: trigger cache invalidation
│   ├── api/
│   │   └── revalidate/
│   │       └── route.ts             # ISR revalidation endpoint (spec 001)
│   ├── layout.tsx                   # Root layout
│   └── manifest.ts                  # PWA manifest (spec 001)
├── components/
│   ├── schedule/                    # Public schedule components (spec 001)
│   │   └── ...
│   └── admin/
│       ├── MatchForm.tsx            # Match create/edit form (keyboard-navigable)
│       ├── MatchList.tsx            # Match list with actions (edit, delete, copy-forward)
│       ├── MatchRow.tsx             # Single match row in list
│       ├── SearchableCombobox.tsx   # Reusable combobox (team, competition selection)
│       ├── MultiSelectCombobox.tsx  # Multi-select combobox (broadcaster selection)
│       ├── ConfidenceSelect.tsx     # Confidence level selector
│       ├── DateTimePicker.tsx       # HKT date/time input
│       ├── CacheInvalidateButton.tsx # Cache invalidation trigger
│       ├── ReferenceManager.tsx     # Reference data CRUD (competitions, teams, broadcasters)
│       └── DeleteConfirmDialog.tsx  # Delete confirmation modal
├── lib/
│   ├── supabase/
│   │   ├── server.ts               # Server client (shared with spec 001)
│   │   ├── client.ts               # Browser client for admin mutations
│   │   ├── middleware.ts            # Auth middleware helper
│   │   └── types.ts                # Generated database types
│   ├── schedule.ts                  # Schedule data fetching (spec 001)
│   ├── date.ts                      # HKT ↔ UTC conversion utilities
│   └── types.ts                     # Shared TypeScript types
├── middleware.ts                    # Next.js middleware (Supabase Auth session refresh + admin route protection)
└── public/
    └── ...                          # Spec 001 assets

tests/
├── unit/
│   ├── date.test.ts                 # HKT→UTC conversion (shared)
│   ├── match-form.test.ts           # Form validation logic
│   └── copy-forward.test.ts         # Copy-forward date calculation
└── e2e/
    ├── admin-auth.spec.ts           # Login, route protection
    ├── admin-crud.spec.ts           # Create, edit, delete match
    ├── admin-keyboard.spec.ts       # Keyboard navigation, tab order
    ├── admin-copy-forward.spec.ts   # Copy-forward workflow
    ├── admin-reference.spec.ts      # Reference data management
    └── admin-invalidation.spec.ts   # Cache invalidation flow
```

**Structure Decision**: Admin pages live within the same Next.js app as the public schedule, using App Router route groups: `(public)/` for spec 001 pages and `(admin)/` for admin pages. This avoids a separate deployment unit while maintaining clear separation. Middleware protects all `/admin/*` routes via Supabase Auth. The main admin page (`/admin`) combines the match list and entry form in a single view to enable fast multi-record entry without page navigation.

## Auth Strategy

### Supabase Auth (email/password)

1. **Single admin user**: Created manually in Supabase dashboard (Auth → Users → Invite). No signup page — the admin user is pre-provisioned.
2. **Login page**: `/admin/login` — simple email/password form using Supabase Auth `signInWithPassword()`.
3. **Middleware**: `middleware.ts` intercepts all requests to `/admin/*` (except `/admin/login`). Uses `@supabase/ssr` to refresh the session cookie and verify the user via `getUser()`. Redirects unauthenticated requests to `/admin/login`.
4. **RLS**: Database-level enforcement. Authenticated user can INSERT/UPDATE/DELETE; anon key can only SELECT.
5. **Session**: Cookie-based via `@supabase/ssr`. Automatic session refresh in middleware. No client-side token management needed.

### Why not simpler auth?

- Environment variable password (e.g., basic auth): Would protect middleware but not the database. Supabase Auth enables RLS policies that enforce write restrictions at the database level — the admin user gets INSERT/UPDATE/DELETE while the anon key is read-only. This is a concrete security benefit, not speculative.
- Vercel Password Protection: Requires Vercel Pro ($20/mo) and doesn't provide database-level RLS integration.

## Admin UX Design

### Main Admin Page (`/admin`)

**Layout**: Two-panel desktop layout.

- **Left panel (60%)**: Match entry form. Always visible. After save, form clears and is ready for the next entry.
- **Right panel (40%)**: Match list for the selected date range. Each row shows match summary with action buttons: Edit (loads into form), Copy Forward (pre-fills form), Delete (confirmation dialog).
- **Top bar**: Date range selector, cache invalidation button, logout.

### Form Field Order (tab sequence)

1. **Date** — date picker, defaults to today (HKT)
2. **Time** — time picker (HKT), 24-hour format
3. **Home team** — searchable combobox (type to filter, arrow keys to navigate, enter to select)
4. **Away team** — searchable combobox
5. **Competition** — searchable combobox
6. **Broadcaster(s)** — multi-select combobox (select multiple, remove with backspace)
7. **Confidence** — simple select (confirmed/unconfirmed/estimated), defaults to confirmed
8. **Submit button** — Enter key or Tab→Enter

### Copy-Forward Behaviour

When triggered on a match row:
1. Form clears and pre-fills: same time, same competition, same broadcaster(s)
2. Date advances by exactly 7 days from the source match
3. Home team and away team are left empty (the fields that change weekly)
4. Focus moves to the home team field (first empty field)

### Cache Invalidation

- **Button**: "Publish Changes" button in the top bar.
- **Action**: Calls `POST /api/revalidate` with the `REVALIDATION_SECRET`.
- **Feedback**: Shows success toast ("Changes published") or error toast ("Failed to publish — retry").
- **Auto-suggestion**: After any save/edit/delete, a non-blocking toast suggests "Changes saved. Publish to update the public site." to remind the operator.

## Complexity Tracking

No violations. All architecture decisions align with the constitution's limits.

| Decision | Justification |
|----------|---------------|
| Headless UI for combobox | Required for keyboard-navigable searchable dropdowns (FR-005, FR-006). Lightweight, unstyled, purpose-built for accessible UI. |
| React Hook Form | Required for inline validation (FR-001 acceptance scenario 6) and form reset after submit (FR-007). Lightweight alternative to formik. |
| Route groups | Separates public and admin pages within one Next.js app without adding a deployment unit. |
