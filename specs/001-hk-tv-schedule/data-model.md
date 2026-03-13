# Data Model: 001-hk-tv-schedule

**Date**: 2026-03-13

## Entity Relationship Overview

```
Competition 1──* Match *──1 Team (home)
                       *──1 Team (away)
                       *──* Broadcaster (via match_broadcasters)
```

## Entities

### competitions

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| name_zh | text | NOT NULL, UNIQUE | Traditional Chinese name (e.g., 英超) |
| name_en | text | nullable | English name (e.g., Premier League) |
| short_name_zh | text | nullable | Short display name for filters |
| sort_order | integer | NOT NULL, default 0 | Display ordering in filter dropdowns |
| created_at | timestamptz | NOT NULL, default now() | Record creation timestamp |

### teams

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| name_zh | text | NOT NULL | Traditional Chinese name (e.g., 利物浦) |
| name_en | text | nullable | English name (e.g., Liverpool) |
| created_at | timestamptz | NOT NULL, default now() | Record creation timestamp |

**Unique constraint**: `(name_zh)` — prevents duplicate team entries.

### broadcasters

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| name | text | NOT NULL, UNIQUE | Display name (e.g., Now TV, ViuTV, ESPN) |
| type | text | NOT NULL, check in ('tv', 'ott') | Broadcast platform type |
| sort_order | integer | NOT NULL, default 0 | Display ordering |
| created_at | timestamptz | NOT NULL, default now() | Record creation timestamp |

### matches

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Unique identifier |
| kick_off_utc | timestamptz | NOT NULL | Kick-off time stored in UTC |
| home_team_id | uuid | NOT NULL, FK → teams.id | Home team reference |
| away_team_id | uuid | NOT NULL, FK → teams.id | Away team reference |
| competition_id | uuid | NOT NULL, FK → competitions.id | Competition reference |
| source_type | text | NOT NULL, default 'manual', check in ('manual', 'scraper', 'api', 'import') | Data ingestion method |
| confidence | text | NOT NULL, default 'confirmed', check in ('confirmed', 'unconfirmed', 'estimated') | Data confidence level |
| last_updated | timestamptz | NOT NULL, default now() | Last verified update timestamp |
| created_at | timestamptz | NOT NULL, default now() | Record creation timestamp |

**Check constraint**: `home_team_id != away_team_id` — a team cannot play itself.

### match_broadcasters (junction table)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| match_id | uuid | NOT NULL, FK → matches.id ON DELETE CASCADE | Match reference |
| broadcaster_id | uuid | NOT NULL, FK → broadcasters.id ON DELETE RESTRICT | Broadcaster reference |

**Primary key**: `(match_id, broadcaster_id)` — composite.

## Indexes

- `matches`: Index on `kick_off_utc` — primary query pattern is filtering by date range.
- `matches`: Index on `competition_id` — for future query optimisation if needed.
- `match_broadcasters`: Index on `match_id` — for joining broadcasters to matches.

## Query Pattern (Public Schedule Page)

The primary query fetches all matches for a given date (in HKT), with related entities:

```
SELECT matches with:
  - home_team (name_zh, name_en)
  - away_team (name_zh, name_en)
  - competition (name_zh, name_en)
  - broadcasters[] (name, type) via match_broadcasters
WHERE kick_off_utc is within the selected date in HKT (UTC+8)
ORDER BY kick_off_utc ASC
```

The date filter converts the selected HKT date to a UTC range:
- Start: `selected_date 00:00:00 HKT` → `selected_date - 1 day 16:00:00 UTC`
- End: `selected_date 23:59:59 HKT` → `selected_date 15:59:59 UTC`

## Staleness Rule

Records where `last_updated` is older than a configurable threshold (default: 7 days) are flagged as potentially stale in the UI. This threshold is an environment variable, not hard-coded.

## Row-Level Security (RLS)

- **Public read**: All tables have RLS enabled with a policy allowing anonymous `SELECT` via the Supabase anon key. No authentication required for reading schedule data.
- **Write access**: Restricted to authenticated admin user (implemented in spec 002). No write access via anon key.

## Seed Data

Initial reference data (competitions, teams, broadcasters) is seeded via a migration or seed script. Includes commonly broadcast competitions in HK:
- Competitions: 英超, 西甲, 意甲, 德甲, 法甲, 歐冠, 歐霸, 世界盃外圍賽, etc.
- Broadcasters: Now TV, Now E, ViuTV, ESPN, beIN Sports, etc.
- Teams: Seeded incrementally as matches are entered.
