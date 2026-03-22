-- seed.sql
-- Reference data for WatchBall HK

-- ============================================================
-- COMPETITIONS
-- ============================================================

INSERT INTO competitions (name_zh, name_en, short_name_zh, sort_order) VALUES
  ('英格蘭超級聯賽', 'Premier League', '英超', 1),
  ('西班牙甲級聯賽', 'La Liga', '西甲', 2),
  ('意大利甲級聯賽', 'Serie A', '意甲', 3),
  ('德國甲級聯賽', 'Bundesliga', '德甲', 4),
  ('法國甲級聯賽', 'Ligue 1', '法甲', 5),
  ('歐洲冠軍聯賽', 'UEFA Champions League', '歐冠', 6),
  ('歐霸盃', 'UEFA Europa League', '歐霸', 7),
  ('歐洲協會聯賽', 'UEFA Conference League', '歐協聯', 8),
  ('英格蘭足總盃', 'FA Cup', '足總盃', 9),
  ('英格蘭聯賽盃', 'EFL Cup', '聯賽盃', 10),
  ('世界盃外圍賽', 'FIFA World Cup Qualifiers', '世盃外', 11),
  ('亞洲冠軍聯賽', 'AFC Champions League', '亞冠', 12),
  ('國際友誼賽', 'International Friendly', '友賽', 13);

-- ============================================================
-- BROADCASTERS
-- ============================================================

INSERT INTO broadcasters (name, type, sort_order) VALUES
  ('Now TV', 'tv', 1),
  ('Now E', 'ott', 2),
  ('ViuTV', 'tv', 3),
  ('ViuTV 99台', 'tv', 4),
  ('myTV SUPER', 'ott', 5),
  ('ESPN', 'tv', 6),
  ('beIN Sports', 'ott', 7),
  ('CCTV5', 'tv', 8);

-- ============================================================
-- TEAMS (common EPL, La Liga, Serie A teams broadcast in HK)
-- ============================================================

INSERT INTO teams (name_zh, name_en) VALUES
  -- English Premier League
  ('阿仙奴', 'Arsenal'),
  ('阿士東維拉', 'Aston Villa'),
  ('布賴頓', 'Brighton'),
  ('車路士', 'Chelsea'),
  ('水晶宮', 'Crystal Palace'),
  ('愛華頓', 'Everton'),
  ('富咸', 'Fulham'),
  ('利物浦', 'Liverpool'),
  ('曼城', 'Manchester City'),
  ('曼聯', 'Manchester United'),
  ('紐卡素', 'Newcastle United'),
  ('諾丁漢森林', 'Nottingham Forest'),
  ('韋斯咸', 'West Ham United'),
  ('熱刺', 'Tottenham Hotspur'),
  ('狼隊', 'Wolverhampton'),
  ('般尼茅夫', 'Bournemouth'),
  ('賓福特', 'Brentford'),
  ('葉士域治', 'Ipswich Town'),
  ('李斯特城', 'Leicester City'),
  ('修咸頓', 'Southampton'),
  -- La Liga
  ('巴塞隆拿', 'Barcelona'),
  ('皇家馬德里', 'Real Madrid'),
  ('馬德里體育會', 'Atletico Madrid'),
  -- Serie A
  ('AC米蘭', 'AC Milan'),
  ('國際米蘭', 'Inter Milan'),
  ('祖雲達斯', 'Juventus'),
  ('拿坡里', 'Napoli'),
  -- Bundesliga
  ('拜仁慕尼黑', 'Bayern Munich'),
  ('多蒙特', 'Borussia Dortmund'),
  -- Ligue 1
  ('巴黎聖日耳門', 'Paris Saint-Germain');

-- ============================================================
-- SAMPLE MATCHES (for development/testing)
-- Using today's date offset for easy testing
-- ============================================================

-- We insert matches relative to 'now' so seed data always has upcoming entries
-- Match 1: EPL - Liverpool vs Arsenal, confirmed, Now TV + Now E
WITH
  home AS (SELECT id FROM teams WHERE name_en = 'Liverpool'),
  away AS (SELECT id FROM teams WHERE name_en = 'Arsenal'),
  comp AS (SELECT id FROM competitions WHERE name_en = 'Premier League'),
  m AS (
    INSERT INTO matches (kick_off_utc, home_team_id, away_team_id, competition_id, confidence, source_type)
    SELECT
      (CURRENT_DATE + INTERVAL '20 hours')::timestamptz,
      home.id, away.id, comp.id, 'confirmed', 'manual'
    FROM home, away, comp
    RETURNING id
  )
INSERT INTO match_broadcasters (match_id, broadcaster_id)
SELECT m.id, b.id FROM m, broadcasters b WHERE b.name IN ('Now TV', 'Now E');

-- Match 2: EPL - Man City vs Chelsea, unconfirmed, Now TV
WITH
  home AS (SELECT id FROM teams WHERE name_en = 'Manchester City'),
  away AS (SELECT id FROM teams WHERE name_en = 'Chelsea'),
  comp AS (SELECT id FROM competitions WHERE name_en = 'Premier League'),
  m AS (
    INSERT INTO matches (kick_off_utc, home_team_id, away_team_id, competition_id, confidence, source_type)
    SELECT
      (CURRENT_DATE + INTERVAL '22 hours 30 minutes')::timestamptz,
      home.id, away.id, comp.id, 'unconfirmed', 'manual'
    FROM home, away, comp
    RETURNING id
  )
INSERT INTO match_broadcasters (match_id, broadcaster_id)
SELECT m.id, b.id FROM m, broadcasters b WHERE b.name = 'Now TV';

-- Match 3: La Liga - Barcelona vs Real Madrid, confirmed, Now E
WITH
  home AS (SELECT id FROM teams WHERE name_en = 'Barcelona'),
  away AS (SELECT id FROM teams WHERE name_en = 'Real Madrid'),
  comp AS (SELECT id FROM competitions WHERE name_en = 'La Liga'),
  m AS (
    INSERT INTO matches (kick_off_utc, home_team_id, away_team_id, competition_id, confidence, source_type)
    SELECT
      (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '3 hours')::timestamptz,
      home.id, away.id, comp.id, 'confirmed', 'manual'
    FROM home, away, comp
    RETURNING id
  )
INSERT INTO match_broadcasters (match_id, broadcaster_id)
SELECT m.id, b.id FROM m, broadcasters b WHERE b.name = 'Now E';

-- Match 4: UCL - Inter Milan vs Bayern Munich, estimated, no broadcaster (test fallback)
WITH
  home AS (SELECT id FROM teams WHERE name_en = 'Inter Milan'),
  away AS (SELECT id FROM teams WHERE name_en = 'Bayern Munich'),
  comp AS (SELECT id FROM competitions WHERE name_en = 'UEFA Champions League')
INSERT INTO matches (kick_off_utc, home_team_id, away_team_id, competition_id, confidence, source_type)
SELECT
  (CURRENT_DATE + INTERVAL '1 day' + INTERVAL '19 hours 45 minutes')::timestamptz,
  home.id, away.id, comp.id, 'estimated', 'manual'
FROM home, away, comp;

-- Match 5: EPL - Tottenham vs Man United, confirmed, ViuTV
WITH
  home AS (SELECT id FROM teams WHERE name_en = 'Tottenham Hotspur'),
  away AS (SELECT id FROM teams WHERE name_en = 'Manchester United'),
  comp AS (SELECT id FROM competitions WHERE name_en = 'Premier League'),
  m AS (
    INSERT INTO matches (kick_off_utc, home_team_id, away_team_id, competition_id, confidence, source_type)
    SELECT
      (CURRENT_DATE + INTERVAL '2 days' + INTERVAL '11 hours 30 minutes')::timestamptz,
      home.id, away.id, comp.id, 'confirmed', 'manual'
    FROM home, away, comp
    RETURNING id
  )
INSERT INTO match_broadcasters (match_id, broadcaster_id)
SELECT m.id, b.id FROM m, broadcasters b WHERE b.name = 'ViuTV';
