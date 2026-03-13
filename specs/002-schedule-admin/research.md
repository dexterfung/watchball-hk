# Research: 002-schedule-admin

**Date**: 2026-03-13

## R1: Admin Auth Strategy

**Decision**: Supabase Auth with email/password, protected via Next.js middleware
**Rationale**: Supabase Auth is already in the stack (user input). Using it for admin auth means: (1) database-level RLS enforcement — writes require authenticated session, not just a password header; (2) auth infrastructure is ready for future user accounts (favourites feature discussed in planning); (3) cookie-based sessions via `@supabase/ssr` integrate natively with Next.js middleware.
**Implementation**: Single admin user pre-created in Supabase dashboard. No signup page. Middleware uses `getUser()` (not `getSession()`) to verify — `getUser()` makes a server call to Supabase Auth, preventing spoofed sessions.
**Alternatives considered**:
- Environment variable / basic auth: Simpler but no RLS integration. Writes would need a separate authorization mechanism at the API level. Doesn't scale to future user auth.
- Vercel Password Protection: Requires paid plan ($20/mo). No database-level enforcement. Doesn't integrate with Supabase RLS.
- NextAuth.js: Additional dependency when Supabase Auth already covers the need. Would add complexity without benefit.

## R2: Route Protection Pattern

**Decision**: Next.js `middleware.ts` with `@supabase/ssr` cookie handling
**Rationale**: The official Supabase recommendation for Next.js App Router. Middleware runs before every request, refreshes expired auth tokens, and redirects unauthenticated users. Critical security note: always use `getUser()` not `getSession()` — `getSession()` reads from cookies without server verification and can be spoofed.
**Pattern**:
- Middleware matches `/admin/:path*` (except `/admin/login`)
- Calls `supabase.auth.getUser()` to verify session
- Redirects to `/admin/login` if no valid user
- Public routes (`/`, etc.) are not affected
**Alternatives considered**:
- Layout-level auth check: Runs too late — the page component already renders before the check. Middleware is the correct interception point for route protection.
- Server Component auth check only: Works for data fetching but doesn't prevent the page shell from loading. Middleware provides a clean redirect before any rendering.

## R3: Keyboard-Navigable Form Components

**Decision**: Headless UI (@headlessui/react) for combobox/listbox
**Rationale**: Headless UI provides unstyled, fully accessible components with complete keyboard support out of the box — specifically the `Combobox` component which supports: type-to-search filtering, arrow key navigation, Enter to select, Escape to close, and full screen-reader support. It's from the Tailwind Labs team, actively maintained, lightweight (~10KB gzipped), and doesn't impose any styling opinions.
**Multi-select**: Headless UI's Combobox supports `multiple` prop for selecting multiple values (needed for broadcaster multi-select).
**Alternatives considered**:
- Radix UI: Excellent accessibility but no built-in Combobox primitive — would need to compose from lower-level primitives (Popover + Command). More assembly required.
- React Aria (Adobe): Very comprehensive but heavier learning curve and more verbose API. Over-engineered for a single-operator admin.
- cmdk: Great for command palettes but not designed for form field comboboxes. Wrong abstraction.
- Custom implementation: High effort to get keyboard handling and accessibility right. Not justified when Headless UI provides it.

## R4: Form State and Validation

**Decision**: React Hook Form
**Rationale**: Lightweight form library (~9KB) with: declarative validation rules, inline error messages, automatic form reset after submission (`reset()`), and uncontrolled component support (better performance for forms with many fields). The `register()` pattern works naturally with tab navigation — no extra keyboard handling needed. Integrates cleanly with Headless UI via `Controller` for custom components.
**Alternatives considered**:
- Plain React state (useState): Works for simple forms but becomes unwieldy with 7+ fields, validation, error states, and form reset logic. No built-in validation.
- Formik: Similar to React Hook Form but larger bundle, less performant (re-renders on every keystroke by default). React Hook Form's uncontrolled approach is better for fast entry.
- Zod + server-side only: Good for validation but doesn't provide client-side form state, error display, or form reset. Would still need a form library on top.

## R5: HKT → UTC Conversion in Admin

**Decision**: Use `Intl.DateTimeFormat` and `Date` API with explicit `Asia/Hong_Kong` timezone
**Rationale**: Same approach as spec 001. The admin form presents date/time inputs in HKT. On submission, the combined date+time is converted to UTC before writing to `kick_off_utc`. Since HK doesn't observe DST, the conversion is always UTC+8 — no edge cases. No library dependency needed.
**Conversion flow**:
1. Operator enters date (YYYY-MM-DD) and time (HH:MM) as separate fields
2. On submit, combine into `${date}T${time}:00+08:00` (explicit HKT offset)
3. `new Date(combined)` gives UTC automatically
4. Write `kick_off_utc` as ISO 8601 UTC string to Supabase

## R6: Cache Invalidation from Admin

**Decision**: Admin calls `POST /api/revalidate` (spec 001's endpoint) via server action
**Rationale**: The revalidation endpoint is already defined in spec 001. The admin simply needs to call it with the shared `REVALIDATION_SECRET`. Using a server action means the secret stays server-side — never exposed to the browser. The operator clicks "Publish Changes", the server action calls the revalidation endpoint, and the response (success/failure) is returned to the UI.
**Alternatives considered**:
- Direct `revalidatePath()` call in admin server actions: Would work since admin and public pages are in the same Next.js app. However, using the API route keeps the contract clean — the admin interacts with the public site through a defined interface, preserving three-layer separation.
- Supabase webhook on row change: Would automate invalidation but removes operator control over when changes go live. The spec explicitly requires the operator to trigger invalidation (FR-011). Also adds Supabase webhook config complexity.

## R7: Server Actions vs API Routes for Mutations

**Decision**: Next.js Server Actions for admin CRUD operations
**Rationale**: Server Actions are the App Router-native way to handle form mutations. They run server-side (secret keys stay secure), integrate naturally with React Hook Form via the `action` prop or manual calls, support progressive enhancement, and don't require manually defining API routes for each operation. For a desktop admin with no external API consumers, server actions are simpler than REST endpoints.
**Alternatives considered**:
- API routes (POST /api/admin/matches): Would work but adds boilerplate for something only the admin UI consumes. No external consumers need these endpoints in v1.
- Direct Supabase client calls from browser: Would expose mutation logic to the client and bypass server-side validation. RLS provides database-level protection, but server-side validation is an additional safety net.
