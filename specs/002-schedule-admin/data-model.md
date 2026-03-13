# Data Model: 002-schedule-admin

**Date**: 2026-03-13

## Shared Schema

The admin operates on the same database tables defined in [spec 001's data model](../001-hk-tv-schedule/data-model.md):

- **competitions** — reference table for leagues/tournaments
- **teams** — reference table for football clubs/national teams
- **broadcasters** — reference table for TV channels and OTT platforms
- **matches** — primary schedule data
- **match_broadcasters** — junction table linking matches to broadcasters

No new tables are introduced by this spec. The admin is the write interface for the existing schema.

## RLS Policies (Admin Additions)

Spec 001 defined read-only access for the anon key. This spec adds write policies for the authenticated admin user.

### matches

| Policy | Operation | Role | Rule |
|--------|-----------|------|------|
| Public read | SELECT | anon, authenticated | `true` (all rows readable) |
| Admin insert | INSERT | authenticated | `true` (authenticated user can insert) |
| Admin update | UPDATE | authenticated | `true` (authenticated user can update any row) |
| Admin delete | DELETE | authenticated | `true` (authenticated user can delete any row) |

### competitions, teams, broadcasters

| Policy | Operation | Role | Rule |
|--------|-----------|------|------|
| Public read | SELECT | anon, authenticated | `true` |
| Admin insert | INSERT | authenticated | `true` |
| Admin update | UPDATE | authenticated | `true` |
| Admin delete (competitions, broadcasters) | DELETE | authenticated | `true` |
| Admin delete (teams) | DELETE | authenticated | `true` |

**Referential integrity note**: `match_broadcasters` uses `ON DELETE RESTRICT` for `broadcaster_id`, preventing deletion of a broadcaster referenced by existing matches. Similarly, `matches` has FK constraints on `home_team_id`, `away_team_id`, and `competition_id` — these reference entities cannot be deleted while matches reference them. The admin UI surfaces this as a warning before deletion.

### match_broadcasters

| Policy | Operation | Role | Rule |
|--------|-----------|------|------|
| Public read | SELECT | anon, authenticated | `true` |
| Admin insert | INSERT | authenticated | `true` |
| Admin delete | DELETE | authenticated | `true` |

No UPDATE policy — junction rows are deleted and re-inserted when broadcaster assignments change.

## Admin-Specific Query Patterns

### Match List (Admin View)

Fetches matches for a date range with all related data, ordered by kick-off time:

```
SELECT matches with:
  - home_team (name_zh, name_en)
  - away_team (name_zh, name_en)
  - competition (name_zh, name_en)
  - broadcasters[] (name, type) via match_broadcasters
  - source_type, confidence, last_updated
WHERE kick_off_utc is within the selected date range (HKT)
ORDER BY kick_off_utc ASC
```

### Reference Data Lists (for dropdowns)

```
SELECT * FROM competitions ORDER BY sort_order, name_zh
SELECT * FROM teams ORDER BY name_zh
SELECT * FROM broadcasters ORDER BY sort_order, name
```

These are fetched once when the admin page loads and cached client-side for the session.

### Copy-Forward Source Query

When the operator triggers copy-forward on a match:

```
SELECT match with:
  - kick_off_utc (to calculate +7 days)
  - competition_id
  - broadcasters[] via match_broadcasters
WHERE match.id = <source_match_id>
```

The result pre-fills the form. Only the date (+7 days) and broadcaster(s) are carried forward; teams are left empty for the operator to fill.

## Mutation Patterns

### Create Match

1. Insert row into `matches` with: `kick_off_utc`, `home_team_id`, `away_team_id`, `competition_id`, `source_type` ('manual'), `confidence`, `last_updated` (now())
2. Insert rows into `match_broadcasters` for each selected broadcaster
3. Both operations in a single transaction (Supabase RPC or sequential inserts with error handling)

### Update Match

1. Update `matches` row: set changed fields + `last_updated` = now()
2. Delete existing `match_broadcasters` rows for this match
3. Re-insert `match_broadcasters` rows for the updated broadcaster selection
4. Transaction wrapper

### Delete Match

1. `match_broadcasters` rows are auto-deleted via `ON DELETE CASCADE` on `match_id`
2. Delete `matches` row

### Duplicate Detection

Before insert, check for existing match with same `home_team_id`, `away_team_id`, and `kick_off_utc` (within the same date in HKT). If found, return a warning — the operator can choose to proceed or cancel.
