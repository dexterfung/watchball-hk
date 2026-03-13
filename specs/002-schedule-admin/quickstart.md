# Quickstart: 002-schedule-admin

**Date**: 2026-03-13

## Prerequisites

Same as [spec 001 quickstart](../001-hk-tv-schedule/quickstart.md):
- Node.js 20+ and pnpm
- Supabase project (Singapore region) — same project as spec 001
- Vercel account
- Spec 001 setup completed (database schema, environment variables)

## Additional Setup (Admin-Specific)

### 1. Create Admin User in Supabase

1. Open Supabase dashboard → Authentication → Users
2. Click "Invite User" or "Add User"
3. Enter the operator's email and a strong password
4. This creates the single admin account — no signup page exists in the app

### 2. Apply RLS Policies

Run the admin RLS migration in Supabase SQL Editor:
`supabase/migrations/002_admin_rls.sql`

This adds INSERT/UPDATE/DELETE policies for authenticated users on all tables.

### 3. Additional Environment Variables

Add to `.env.local` (in addition to spec 001's variables):

```
# Already set by spec 001:
# NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
# REVALIDATION_SECRET=<secret>
```

No additional environment variables are needed. The admin uses the same Supabase project and anon key. Auth is handled by Supabase Auth sessions, not separate credentials.

### 4. Install Additional Dependencies

```bash
pnpm add @headlessui/react react-hook-form @supabase/ssr
```

(`@supabase/ssr` may already be installed from spec 001.)

### 5. Run Development Server

```bash
pnpm dev
```

- Public schedule: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`
- Admin dashboard: `http://localhost:3000/admin` (redirects to login if not authenticated)

### 6. Run Tests

```bash
# Unit tests (includes admin form tests)
pnpm test

# E2E tests (includes admin auth, CRUD, keyboard nav)
pnpm test:e2e
```

## Key Workflows

### First-Time Setup

1. Complete spec 001 setup (database schema, seed data)
2. Create admin user in Supabase dashboard
3. Apply RLS migration
4. Log in at `/admin/login`
5. Start entering match data

### Weekly Data Entry Session

1. Open `/admin` and log in
2. Enter matches using the form (keyboard-only flow):
   - Tab through fields: date → time → home team → away team → competition → broadcaster(s) → confidence
   - Type to search in dropdowns, arrow keys to select
   - Enter to submit — form clears for next entry
3. For recurring fixtures: click "Copy Forward" on last week's entry, change date/teams
4. Click "Publish Changes" to trigger cache invalidation
5. Verify changes on the public schedule

### Correcting a Published Entry

1. Find the match in the admin list
2. Click "Edit" — fields load into the form
3. Make corrections, save
4. Click "Publish Changes" — public site updates within 30 seconds
