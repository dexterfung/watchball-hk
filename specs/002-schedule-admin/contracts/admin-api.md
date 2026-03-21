# Admin API Contracts: 002-schedule-admin

**Date**: 2026-03-13

## Overview

The admin uses Next.js Server Actions for all mutations — there are no public API endpoints exposed by this feature. The only external interface is the cache invalidation call to spec 001's `POST /api/revalidate` endpoint.

This document defines the server action contracts (input/output shapes) for consistency between admin UI components and server-side logic.

## Server Actions

### createMatch

**File**: `src/app/(admin)/actions/matches.ts`

**Input**:
```typescript
interface CreateMatchInput {
  kickOffDate: string;        // YYYY-MM-DD (HKT)
  kickOffTime: string;        // HH:MM (24-hour, HKT)
  homeTeamId: string;         // UUID
  awayTeamId: string;         // UUID
  competitionId: string;      // UUID
  broadcasterIds: string[];   // UUID[] (may be empty)
  confidence: 'confirmed' | 'unconfirmed' | 'estimated';
}
```

**Output**:
```typescript
interface CreateMatchResult {
  success: boolean;
  match?: { id: string };
  error?: string;
  duplicateWarning?: {        // Set if a similar match exists
    existingMatchId: string;
    message: string;
  };
}
```

**Behaviour**:
- Converts `kickOffDate` + `kickOffTime` (HKT) → UTC `timestamptz`
- Sets `source_type` = 'manual', `last_updated` = now()
- Inserts match + match_broadcasters in sequence
- Returns `duplicateWarning` if a match with same teams and kick-off exists (does not block save)

### updateMatch

**Input**:
```typescript
interface UpdateMatchInput {
  matchId: string;            // UUID
  kickOffDate?: string;       // YYYY-MM-DD (HKT)
  kickOffTime?: string;       // HH:MM (24-hour, HKT)
  homeTeamId?: string;
  awayTeamId?: string;
  competitionId?: string;
  broadcasterIds?: string[];  // Full replacement (not additive)
  confidence?: 'confirmed' | 'unconfirmed' | 'estimated';
}
```

**Output**:
```typescript
interface UpdateMatchResult {
  success: boolean;
  error?: string;
}
```

**Behaviour**:
- Updates only provided fields
- Always sets `last_updated` = now()
- If `broadcasterIds` provided, deletes all existing match_broadcasters and re-inserts

### deleteMatch

**Input**:
```typescript
interface DeleteMatchInput {
  matchId: string;            // UUID
}
```

**Output**:
```typescript
interface DeleteMatchResult {
  success: boolean;
  error?: string;
}
```

**Behaviour**:
- Deletes the match row (match_broadcasters cascade-deleted via FK)
- Confirmation is handled by the UI before calling this action

### triggerCacheInvalidation

**Input**: None (no parameters)

**Output**:
```typescript
interface InvalidationResult {
  success: boolean;
  error?: string;
  timestamp?: string;         // ISO 8601 UTC
}
```

**Behaviour**:
- Calls `POST /api/revalidate?secret=<REVALIDATION_SECRET>` (spec 001 endpoint)
- Secret is read from server-side environment variable — never sent to the client
- Returns the result to the UI for toast display

### createReferenceItem

**Input**:
```typescript
interface CreateReferenceInput {
  type: 'competition' | 'team' | 'broadcaster';
  nameZh: string;             // Required for competition/team
  nameEn?: string;            // Optional for competition/team
  name?: string;              // Required for broadcaster
  broadcasterType?: 'tv' | 'ott';  // Required for broadcaster
  sortOrder?: number;
}
```

**Output**:
```typescript
interface CreateReferenceResult {
  success: boolean;
  item?: { id: string };
  error?: string;             // e.g., "Duplicate name"
}
```

### deleteReferenceItem

**Input**:
```typescript
interface DeleteReferenceInput {
  type: 'competition' | 'team' | 'broadcaster';
  id: string;                   // UUID
}
```

**Output**:
```typescript
interface DeleteReferenceResult {
  success: boolean;
  error?: string;               // e.g., "Referenced by 3 matches"
}
```

**Behaviour**:
- Checks if the item is referenced by any match records before deleting
- If referenced, returns error with count — does not delete
- If unreferenced, deletes the row

## Auth Contract

All server actions verify the user session before executing. If no valid session exists, they return `{ success: false, error: 'Unauthorized' }` with no mutation performed.

## Cross-Feature Contract

### Cache Invalidation (001 ↔ 002)

The admin (002) triggers cache invalidation by calling the public site's (001) revalidation endpoint:

```
POST /api/revalidate?secret=<REVALIDATION_SECRET>
```

This endpoint is defined in [spec 001's API contract](../001-hk-tv-schedule/contracts/api.md). The `REVALIDATION_SECRET` environment variable must be identical in both the server action environment and the API route environment (same Vercel project, so this is automatic).
