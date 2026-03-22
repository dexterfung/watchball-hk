"use client";

import type { FilterOption } from "@/lib/types";

interface FilterBarProps {
  competitions: FilterOption[];
  teams: FilterOption[];
  activeCompetitionId: string | null;
  activeTeamId: string | null;
  onCompetitionChange: (id: string | null) => void;
  onTeamChange: (id: string | null) => void;
}

export function FilterBar({
  competitions,
  teams,
  activeCompetitionId,
  activeTeamId,
  onCompetitionChange,
  onTeamChange,
}: FilterBarProps) {
  const hasActiveFilter = activeCompetitionId || activeTeamId;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <select
          value={activeCompetitionId ?? ""}
          onChange={(e) =>
            onCompetitionChange(e.target.value || null)
          }
          className="min-h-[44px] flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          aria-label="篩選賽事"
        >
          <option value="">所有賽事</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={activeTeamId ?? ""}
          onChange={(e) => onTeamChange(e.target.value || null)}
          className="min-h-[44px] flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          aria-label="篩選球隊"
        >
          <option value="">所有球隊</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilter && (
        <button
          onClick={() => {
            onCompetitionChange(null);
            onTeamChange(null);
          }}
          className="self-start text-xs text-blue-600 hover:text-blue-800 underline dark:text-blue-400 dark:hover:text-blue-300"
        >
          清除篩選
        </button>
      )}
    </div>
  );
}
