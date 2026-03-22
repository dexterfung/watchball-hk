"use client";

import type { FilterOption } from "@/lib/types";
import type { Language } from "./LanguageProvider";

interface FilterBarProps {
  competitions: FilterOption[];
  teams: FilterOption[];
  activeCompetitionId: string | null;
  activeTeamId: string | null;
  onCompetitionChange: (id: string | null) => void;
  onTeamChange: (id: string | null) => void;
  lang: Language;
}

function optionLabel(opt: FilterOption, lang: Language) {
  if (lang === "en") return opt.labelEn || opt.label;
  return opt.label;
}

export function FilterBar({
  competitions,
  teams,
  activeCompetitionId,
  activeTeamId,
  onCompetitionChange,
  onTeamChange,
  lang,
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
          aria-label={lang === "zh" ? "篩選賽事" : "Filter by competition"}
        >
          <option value="">{lang === "zh" ? "所有賽事" : "All competitions"}</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {optionLabel(c, lang)}
            </option>
          ))}
        </select>

        <select
          value={activeTeamId ?? ""}
          onChange={(e) => onTeamChange(e.target.value || null)}
          className="min-h-[44px] flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          aria-label={lang === "zh" ? "篩選球隊" : "Filter by team"}
        >
          <option value="">{lang === "zh" ? "所有球隊" : "All teams"}</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {optionLabel(t, lang)}
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
          {lang === "zh" ? "清除篩選" : "Clear filters"}
        </button>
      )}
    </div>
  );
}
