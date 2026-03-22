"use client";

import { useState } from "react";
import type { MatchEntry, FilterOption } from "@/lib/types";
import { useLanguage } from "./LanguageProvider";
import { MatchCard } from "./MatchCard";
import { EmptyState } from "./EmptyState";
import { FilterBar } from "./FilterBar";

interface MatchListProps {
  matches: MatchEntry[];
  competitions: FilterOption[];
  teams: FilterOption[];
}

export function MatchList({ matches, competitions, teams }: MatchListProps) {
  const { lang } = useLanguage();
  const [activeCompetitionId, setActiveCompetitionId] = useState<string | null>(
    null,
  );
  const [activeTeamId, setActiveTeamId] = useState<string | null>(null);

  const hasFilters = competitions.length > 1 || teams.length > 1;

  const filteredMatches = matches.filter((match) => {
    if (
      activeCompetitionId &&
      match.competition.id !== activeCompetitionId
    ) {
      return false;
    }
    if (
      activeTeamId &&
      match.homeTeam.id !== activeTeamId &&
      match.awayTeam.id !== activeTeamId
    ) {
      return false;
    }
    return true;
  });

  const hasActiveFilter = activeCompetitionId || activeTeamId;
  const clearFilters = () => {
    setActiveCompetitionId(null);
    setActiveTeamId(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {hasFilters && (
        <FilterBar
          competitions={competitions}
          teams={teams}
          activeCompetitionId={activeCompetitionId}
          activeTeamId={activeTeamId}
          onCompetitionChange={setActiveCompetitionId}
          onTeamChange={setActiveTeamId}
          lang={lang}
        />
      )}

      {filteredMatches.length === 0 ? (
        <EmptyState
          message={
            hasActiveFilter
              ? lang === "zh"
                ? "沒有符合篩選條件的賽事"
                : "No matches found for this filter"
              : undefined
          }
          onClearFilters={hasActiveFilter ? clearFilters : undefined}
          lang={lang}
        />
      ) : (
        filteredMatches.map((match) => (
          <MatchCard key={match.id} match={match} lang={lang} />
        ))
      )}
    </div>
  );
}
