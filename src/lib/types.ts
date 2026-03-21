export interface SchedulePageData {
  date: string; // ISO date string (YYYY-MM-DD) in HKT
  matches: MatchEntry[];
  filters: {
    competitions: FilterOption[];
    teams: FilterOption[];
  };
}

export interface MatchEntry {
  id: string;
  kickOffHKT: string; // ISO datetime string in HKT (UTC+8)
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  competition: CompetitionInfo;
  broadcasters: BroadcasterInfo[]; // May be empty (graceful fallback in UI)
  confidence: "confirmed" | "unconfirmed" | "estimated";
  lastUpdated: string; // ISO datetime string (UTC)
}

export interface TeamInfo {
  id: string;
  nameZh: string;
  nameEn: string | null;
}

export interface CompetitionInfo {
  id: string;
  nameZh: string;
  nameEn: string | null;
}

export interface BroadcasterInfo {
  id: string;
  name: string;
  type: "tv" | "ott";
}

export interface FilterOption {
  id: string;
  label: string; // nameZh for display
}
