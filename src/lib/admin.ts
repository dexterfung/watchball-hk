import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getHKTDateRange, toHKTISOString } from "@/lib/date";
import type { MatchEntry } from "@/lib/types";

export interface ReferenceData {
  competitions: Array<{
    id: string;
    nameZh: string;
    nameEn: string | null;
    sortOrder: number;
  }>;
  teams: Array<{
    id: string;
    nameZh: string;
    nameEn: string | null;
  }>;
  broadcasters: Array<{
    id: string;
    name: string;
    type: "tv" | "ott";
    sortOrder: number;
  }>;
}

export async function fetchAdminMatches(
  startDate: string,
  endDate: string,
): Promise<MatchEntry[]> {
  const supabase = createSupabaseServerClient();
  const { start } = getHKTDateRange(startDate);
  const { end } = getHKTDateRange(endDate);

  const { data: matches, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      kick_off_utc,
      confidence,
      last_updated,
      source_type,
      home_team:teams!home_team_id(id, name_zh, name_en),
      away_team:teams!away_team_id(id, name_zh, name_en),
      competition:competitions!competition_id(id, name_zh, name_en),
      match_broadcasters(
        broadcaster:broadcasters(id, name, type)
      )
    `,
    )
    .gte("kick_off_utc", start)
    .lte("kick_off_utc", end)
    .order("kick_off_utc", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch admin matches: ${error.message}`);
  }

  return (matches ?? []).map((m) => {
    const homeTeam = m.home_team as unknown as {
      id: string;
      name_zh: string;
      name_en: string | null;
    };
    const awayTeam = m.away_team as unknown as {
      id: string;
      name_zh: string;
      name_en: string | null;
    };
    const competition = m.competition as unknown as {
      id: string;
      name_zh: string;
      name_en: string | null;
    };
    const broadcasters = (
      m.match_broadcasters as unknown as Array<{
        broadcaster: { id: string; name: string; type: "tv" | "ott" };
      }>
    ).map((mb) => mb.broadcaster);

    return {
      id: m.id,
      kickOffHKT: toHKTISOString(m.kick_off_utc),
      homeTeam: {
        id: homeTeam.id,
        nameZh: homeTeam.name_zh,
        nameEn: homeTeam.name_en,
      },
      awayTeam: {
        id: awayTeam.id,
        nameZh: awayTeam.name_zh,
        nameEn: awayTeam.name_en,
      },
      competition: {
        id: competition.id,
        nameZh: competition.name_zh,
        nameEn: competition.name_en,
      },
      broadcasters,
      confidence: m.confidence as MatchEntry["confidence"],
      lastUpdated: m.last_updated,
    };
  });
}

export async function fetchReferenceData(): Promise<ReferenceData> {
  const supabase = createSupabaseServerClient();

  const [competitionsRes, teamsRes, broadcastersRes] = await Promise.all([
    supabase
      .from("competitions")
      .select("id, name_zh, name_en, sort_order")
      .order("sort_order")
      .order("name_zh"),
    supabase
      .from("teams")
      .select("id, name_zh, name_en")
      .order("name_zh"),
    supabase
      .from("broadcasters")
      .select("id, name, type, sort_order")
      .order("sort_order")
      .order("name"),
  ]);

  if (competitionsRes.error) {
    throw new Error(
      `Failed to fetch competitions: ${competitionsRes.error.message}`,
    );
  }
  if (teamsRes.error) {
    throw new Error(`Failed to fetch teams: ${teamsRes.error.message}`);
  }
  if (broadcastersRes.error) {
    throw new Error(
      `Failed to fetch broadcasters: ${broadcastersRes.error.message}`,
    );
  }

  return {
    competitions: (competitionsRes.data ?? []).map((c) => ({
      id: c.id,
      nameZh: c.name_zh,
      nameEn: c.name_en,
      sortOrder: c.sort_order,
    })),
    teams: (teamsRes.data ?? []).map((t) => ({
      id: t.id,
      nameZh: t.name_zh,
      nameEn: t.name_en,
    })),
    broadcasters: (broadcastersRes.data ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      type: b.type as "tv" | "ott",
      sortOrder: b.sort_order,
    })),
  };
}

export async function getCopyForwardData(matchId: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("matches")
    .select(
      `
      kick_off_utc,
      competition_id,
      match_broadcasters(broadcaster_id)
    `,
    )
    .eq("id", matchId)
    .single();

  if (error || !data) {
    throw new Error(`Failed to fetch match for copy-forward: ${error?.message}`);
  }

  const sourceHKT = toHKTISOString(data.kick_off_utc);
  const sourceDate = new Date(data.kick_off_utc);
  sourceDate.setUTCDate(sourceDate.getUTCDate() + 7);
  const newDateHKT = toHKTISOString(sourceDate.toISOString());

  return {
    kickOffDate: newDateHKT.slice(0, 10), // YYYY-MM-DD
    kickOffTime: sourceHKT.slice(11, 16), // HH:MM (keep original time)
    competitionId: data.competition_id,
    broadcasterIds: (
      data.match_broadcasters as unknown as Array<{
        broadcaster_id: string;
      }>
    ).map((mb) => mb.broadcaster_id),
  };
}
