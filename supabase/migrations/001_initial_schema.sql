-- 001_initial_schema.sql
-- Database schema for WatchBall HK football TV schedule

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE competitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_zh text NOT NULL UNIQUE,
  name_en text,
  short_name_zh text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_zh text NOT NULL UNIQUE,
  name_en text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE broadcasters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('tv', 'ott')),
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kick_off_utc timestamptz NOT NULL,
  home_team_id uuid NOT NULL REFERENCES teams(id),
  away_team_id uuid NOT NULL REFERENCES teams(id),
  competition_id uuid NOT NULL REFERENCES competitions(id),
  source_type text NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'scraper', 'api', 'import')),
  confidence text NOT NULL DEFAULT 'confirmed' CHECK (confidence IN ('confirmed', 'unconfirmed', 'estimated')),
  last_updated timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

CREATE TABLE match_broadcasters (
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  broadcaster_id uuid NOT NULL REFERENCES broadcasters(id) ON DELETE RESTRICT,
  PRIMARY KEY (match_id, broadcaster_id)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_matches_kick_off_utc ON matches(kick_off_utc);
CREATE INDEX idx_matches_competition_id ON matches(competition_id);
CREATE INDEX idx_match_broadcasters_match_id ON match_broadcasters(match_id);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_broadcasters ENABLE ROW LEVEL SECURITY;

-- Public read access via anon key
CREATE POLICY "Public read competitions" ON competitions FOR SELECT USING (true);
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read broadcasters" ON broadcasters FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read match_broadcasters" ON match_broadcasters FOR SELECT USING (true);
