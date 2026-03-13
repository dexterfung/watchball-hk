# Quickstart: 001-hk-tv-schedule

**Date**: 2026-03-13

## Prerequisites

- Node.js 20+ and pnpm (or npm)
- Supabase account (free tier) at https://supabase.com
- Vercel account (free tier) at https://vercel.com
- Git

## Initial Setup

### 1. Create Supabase Project

1. Create a new project in Supabase dashboard (select **Singapore** region)
2. Note the project URL and anon key from Settings → API
3. Run the database migration in `supabase/migrations/001_initial_schema.sql` via the Supabase SQL Editor
4. (Optional) Run the seed script to populate reference data (competitions, teams, broadcasters)

### 2. Environment Variables

Create `.env.local` at the repository root:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
REVALIDATION_SECRET=<generate-a-random-secret>
```

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the schedule page.

### 5. Run Tests

```bash
# Unit tests
pnpm test

# E2E tests (requires dev server running)
pnpm test:e2e
```

## Deployment (Vercel)

1. Connect the repository to Vercel
2. Set environment variables in Vercel dashboard (same as `.env.local` above)
3. Configure the Vercel project:
   - Framework: Next.js
   - Region: Hong Kong (hkg1) for Serverless Functions
4. Deploy — Vercel auto-detects Next.js and builds accordingly

## Key Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build (includes service worker compilation) |
| `pnpm start` | Start production server locally |
| `pnpm test` | Run Vitest unit tests |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm lint` | Run ESLint |

## Project Structure Reference

See `plan.md` → Project Structure section for the full directory layout.

## Notes

- The build script must include `--webpack` flag if using Next.js 16+ (Turbopack is default but Serwist requires Webpack)
- PWA features (service worker, offline) only work in production builds (`pnpm build && pnpm start`), not in dev mode
- On-demand revalidation requires the `REVALIDATION_SECRET` to be set in both Vercel and the admin interface (spec 002)
