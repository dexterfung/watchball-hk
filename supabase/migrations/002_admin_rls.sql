-- 002_admin_rls.sql
-- Add write policies for authenticated admin user

-- ============================================================
-- MATCHES — authenticated can INSERT/UPDATE/DELETE
-- ============================================================

CREATE POLICY "Admin insert matches" ON matches
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin update matches" ON matches
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin delete matches" ON matches
  FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- COMPETITIONS — authenticated can INSERT/UPDATE/DELETE
-- ============================================================

CREATE POLICY "Admin insert competitions" ON competitions
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin update competitions" ON competitions
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin delete competitions" ON competitions
  FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- TEAMS — authenticated can INSERT/UPDATE/DELETE
-- ============================================================

CREATE POLICY "Admin insert teams" ON teams
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin update teams" ON teams
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin delete teams" ON teams
  FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- BROADCASTERS — authenticated can INSERT/UPDATE/DELETE
-- ============================================================

CREATE POLICY "Admin insert broadcasters" ON broadcasters
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin update broadcasters" ON broadcasters
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin delete broadcasters" ON broadcasters
  FOR DELETE TO authenticated
  USING (true);

-- ============================================================
-- MATCH_BROADCASTERS — authenticated can INSERT/DELETE (no UPDATE)
-- ============================================================

CREATE POLICY "Admin insert match_broadcasters" ON match_broadcasters
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin delete match_broadcasters" ON match_broadcasters
  FOR DELETE TO authenticated
  USING (true);
