-- 004_broadcaster_channels.sql
-- Replace free-text channel on match_broadcasters with a predefined
-- broadcaster_channels reference table.

-- ============================================================
-- 1. Create broadcaster_channels table
-- ============================================================

CREATE TABLE broadcaster_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcaster_id uuid NOT NULL REFERENCES broadcasters(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (broadcaster_id, name)
);

CREATE INDEX idx_broadcaster_channels_broadcaster
  ON broadcaster_channels(broadcaster_id);

-- RLS
ALTER TABLE broadcaster_channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read broadcaster_channels"
  ON broadcaster_channels FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated insert broadcaster_channels"
  ON broadcaster_channels FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated update broadcaster_channels"
  ON broadcaster_channels FOR UPDATE TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated delete broadcaster_channels"
  ON broadcaster_channels FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- 2. Migrate existing free-text channel data
-- ============================================================

-- Insert distinct (broadcaster_id, channel) pairs into broadcaster_channels
INSERT INTO broadcaster_channels (broadcaster_id, name)
SELECT DISTINCT broadcaster_id, channel
FROM match_broadcasters
WHERE channel IS NOT NULL AND channel <> '';

-- ============================================================
-- 3. Modify match_broadcasters
-- ============================================================

-- Add new columns
ALTER TABLE match_broadcasters
  ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN broadcaster_channel_id uuid REFERENCES broadcaster_channels(id) ON DELETE SET NULL;

-- Backfill broadcaster_channel_id from migrated data
UPDATE match_broadcasters mb
SET broadcaster_channel_id = bc.id
FROM broadcaster_channels bc
WHERE mb.broadcaster_id = bc.broadcaster_id
  AND mb.channel = bc.name;

-- Drop old composite PK and channel column
ALTER TABLE match_broadcasters DROP CONSTRAINT match_broadcasters_pkey;
ALTER TABLE match_broadcasters ADD PRIMARY KEY (id);
ALTER TABLE match_broadcasters DROP COLUMN channel;

-- Prevent exact duplicate (same broadcaster + same channel on same match)
-- NULL broadcaster_channel_id is treated as distinct by default in unique constraints,
-- so we need a partial unique index for the NULL case too.
CREATE UNIQUE INDEX idx_match_broadcasters_unique
  ON match_broadcasters (match_id, broadcaster_id, broadcaster_channel_id)
  WHERE broadcaster_channel_id IS NOT NULL;

CREATE UNIQUE INDEX idx_match_broadcasters_unique_no_channel
  ON match_broadcasters (match_id, broadcaster_id)
  WHERE broadcaster_channel_id IS NULL;
