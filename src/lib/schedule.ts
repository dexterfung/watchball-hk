import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getHKTDateRange, toHKTISOString } from "@/lib/date";
import type {
  SchedulePageData,
  MatchEntry,
  FilterOption,
} from "@/lib/types";

export async function fetchScheduleByDate(
  date: string,
): Promise<SchedulePageData> {
  const supabase = createSupabaseServerClient();
  const { start, end } = getHKTDateRange(date);

  // Fetch matches with related data
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
      competition:competitions!competition_id(id, name_zh, name_en, short_name_zh),
      match_broadcasters(
        id,
        broadcaster_channel:broadcaster_channels(id, name),
        broadcaster:broadcasters(id, name, type)
      )
    `,
    )
    .gte("kick_off_utc", start)
    .lte("kick_off_utc", end)
    .order("kick_off_utc", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch schedule: ${error.message}`);
  }

  // Transform to MatchEntry shape
  const matchEntries: MatchEntry[] = (matches ?? []).map((m) => {
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
      short_name_zh: string | null;
    };
    const broadcasters = (
      m.match_broadcasters as unknown as Array<{
        id: string;
        broadcaster_channel: { id: string; name: string } | null;
        broadcaster: { id: string; name: string; type: "tv" | "ott" };
      }>
    ).map((mb) => ({
      ...mb.broadcaster,
      channel: mb.broadcaster_channel?.name ?? null,
      channelId: mb.broadcaster_channel?.id ?? null,
      rowKey: mb.id,
    }));

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
        shortNameZh: competition.short_name_zh,
        nameEn: competition.name_en,
      },
      broadcasters,
      confidence: m.confidence as MatchEntry["confidence"],
      lastUpdated: m.last_updated,
    };
  });

  // Derive filter options from this day's matches
  const competitionMap = new Map<string, FilterOption>();
  const teamMap = new Map<string, FilterOption>();

  for (const match of matchEntries) {
    if (!competitionMap.has(match.competition.id)) {
      competitionMap.set(match.competition.id, {
        id: match.competition.id,
        label: match.competition.nameZh,
        labelEn: match.competition.nameEn,
      });
    }
    if (!teamMap.has(match.homeTeam.id)) {
      teamMap.set(match.homeTeam.id, {
        id: match.homeTeam.id,
        label: match.homeTeam.nameZh,
        labelEn: match.homeTeam.nameEn,
      });
    }
    if (!teamMap.has(match.awayTeam.id)) {
      teamMap.set(match.awayTeam.id, {
        id: match.awayTeam.id,
        label: match.awayTeam.nameZh,
        labelEn: match.awayTeam.nameEn,
      });
    }
  }

  return {
    date,
    matches: matchEntries,
    filters: {
      competitions: Array.from(competitionMap.values()),
      teams: Array.from(teamMap.values()).sort((a, b) =>
        a.label.localeCompare(b.label, "zh-Hant"),
      ),
    },
  };
}
