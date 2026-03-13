# API Contracts: 001-hk-tv-schedule

**Date**: 2026-03-13

## Overview

Feature 001 exposes one API endpoint: the on-demand ISR revalidation route. The public schedule page itself is served as static HTML (ISR) with no public API — all data is embedded at build/revalidation time.

## Endpoints

### POST /api/revalidate

Triggers on-demand ISR revalidation of the schedule page. Called by the admin interface (spec 002) after creating, editing, or deleting match records.

**Authentication**: Secret token via query parameter. The token is stored as an environment variable (`REVALIDATION_SECRET`) and must match the value sent by the caller.

**Request**:

```
POST /api/revalidate?secret=<REVALIDATION_SECRET>
Content-Type: application/json

{
  "paths": ["/"]       // Optional: specific paths to revalidate. Defaults to "/" if omitted.
}
```

**Response (success)**:

```
HTTP 200
Content-Type: application/json

{
  "revalidated": true,
  "paths": ["/"],
  "timestamp": "2026-03-13T12:00:00Z"
}
```

**Response (invalid secret)**:

```
HTTP 401
Content-Type: application/json

{
  "error": "Invalid revalidation secret"
}
```

**Response (revalidation failure)**:

```
HTTP 500
Content-Type: application/json

{
  "error": "Revalidation failed",
  "details": "..."
}
```

## Data Contract: Schedule Page Props

The Server Component fetches schedule data from Supabase and passes it to the Client Component. This is the shape of data flowing from server to client within the page — not a public API, but documented for consistency between server fetch and client rendering.

```typescript
interface SchedulePageData {
  date: string;                    // ISO date string (YYYY-MM-DD) in HKT
  matches: MatchEntry[];
  filters: {
    competitions: FilterOption[];  // Derived from matches on this date
    teams: FilterOption[];         // Derived from matches on this date
  };
}

interface MatchEntry {
  id: string;
  kickOffHKT: string;             // ISO datetime string in HKT (UTC+8)
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  competition: CompetitionInfo;
  broadcasters: BroadcasterInfo[]; // May be empty (graceful fallback in UI)
  confidence: 'confirmed' | 'unconfirmed' | 'estimated';
  lastUpdated: string;             // ISO datetime string (UTC)
}

interface TeamInfo {
  id: string;
  nameZh: string;
  nameEn: string | null;
}

interface CompetitionInfo {
  id: string;
  nameZh: string;
  nameEn: string | null;
}

interface BroadcasterInfo {
  id: string;
  name: string;
  type: 'tv' | 'ott';
}

interface FilterOption {
  id: string;
  label: string;                   // nameZh for display
}
```
