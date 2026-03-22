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
  channel?: string | null;
}

export interface BroadcasterSelection {
  broadcasterId: string;
  channel?: string;
}

export interface FilterOption {
  id: string;
  label: string; // nameZh for display
}

// ============================================================
// Admin types (002-schedule-admin)
// ============================================================

export interface CreateMatchInput {
  kickOffDate: string; // YYYY-MM-DD (HKT)
  kickOffTime: string; // HH:MM (24-hour, HKT)
  homeTeamId: string;
  awayTeamId: string;
  competitionId: string;
  broadcasters: BroadcasterSelection[]; // May be empty
  confidence: "confirmed" | "unconfirmed" | "estimated";
}

export interface CreateMatchResult {
  success: boolean;
  match?: { id: string };
  error?: string;
  duplicateWarning?: {
    existingMatchId: string;
    message: string;
  };
}

export interface UpdateMatchInput {
  matchId: string;
  kickOffDate?: string;
  kickOffTime?: string;
  homeTeamId?: string;
  awayTeamId?: string;
  competitionId?: string;
  broadcasters?: BroadcasterSelection[]; // Full replacement (not additive)
  confidence?: "confirmed" | "unconfirmed" | "estimated";
}

export interface UpdateMatchResult {
  success: boolean;
  error?: string;
}

export interface DeleteMatchInput {
  matchId: string;
}

export interface DeleteMatchResult {
  success: boolean;
  error?: string;
}

export interface InvalidationResult {
  success: boolean;
  error?: string;
  timestamp?: string; // ISO 8601 UTC
}

export interface CreateReferenceInput {
  type: "competition" | "team" | "broadcaster";
  nameZh?: string;
  nameEn?: string;
  name?: string; // Required for broadcaster
  broadcasterType?: "tv" | "ott"; // Required for broadcaster
  sortOrder?: number;
}

export interface CreateReferenceResult {
  success: boolean;
  item?: { id: string };
  error?: string;
}

export interface UpdateReferenceInput {
  type: "competition" | "team" | "broadcaster";
  id: string;
  nameZh?: string;
  nameEn?: string;
  name?: string;
  broadcasterType?: "tv" | "ott";
  sortOrder?: number;
}

export interface UpdateReferenceResult {
  success: boolean;
  error?: string;
}

export interface DeleteReferenceInput {
  type: "competition" | "team" | "broadcaster";
  id: string;
}

export interface DeleteReferenceResult {
  success: boolean;
  error?: string;
}
