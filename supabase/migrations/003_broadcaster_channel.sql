-- 003_broadcaster_channel.sql
-- Add channel number to match_broadcasters (varies per match)

ALTER TABLE match_broadcasters ADD COLUMN channel text;
