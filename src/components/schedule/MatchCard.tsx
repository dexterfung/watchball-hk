import type { MatchEntry } from "@/lib/types";
import type { Language } from "./LanguageProvider";
import { formatTimeHKT } from "@/lib/date";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface MatchCardProps {
  match: MatchEntry;
  lang: Language;
}

const STALENESS_THRESHOLD_DAYS = parseInt(
  process.env.NEXT_PUBLIC_STALENESS_THRESHOLD_DAYS ?? "7",
  10,
);

function isStale(lastUpdated: string): boolean {
  const updated = new Date(lastUpdated).getTime();
  const threshold = Date.now() - STALENESS_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
  return updated < threshold;
}

function teamName(team: { nameZh: string; nameEn: string | null }, lang: Language) {
  if (lang === "en") return team.nameEn || team.nameZh;
  return team.nameZh;
}

function competitionName(
  comp: { nameZh: string; nameEn: string | null; shortNameZh: string | null },
  lang: Language,
) {
  if (lang === "en") return comp.nameEn || comp.nameZh;
  return comp.nameZh;
}

export function MatchCard({ match, lang }: MatchCardProps) {
  const time = formatTimeHKT(match.kickOffHKT);
  const stale = isStale(match.lastUpdated);

  return (
    <article className={`rounded-lg border p-4 shadow-sm ${stale ? "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/50" : "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"}`}>
      <div className="flex items-start gap-3">
        {/* Kick-off time */}
        <div className="flex-shrink-0 text-center">
          <time className="text-xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
            {time}
          </time>
          <p className="text-xs text-gray-500 dark:text-gray-400">HKT</p>
        </div>

        {/* Match details */}
        <div className="min-w-0 flex-1">
          {/* Teams */}
          <p className="text-base font-medium text-gray-900 dark:text-gray-100">
            {teamName(match.homeTeam, lang)}
            <span className="mx-1.5 text-xs font-normal text-gray-400 dark:text-gray-500">vs</span>
            {teamName(match.awayTeam, lang)}
          </p>

          {/* Competition */}
          <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400">
            {competitionName(match.competition, lang)}
          </p>

          {/* Broadcasters */}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {match.broadcasters.length > 0 ? (
              match.broadcasters.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                >
                  {b.name}{b.channel && ` ${b.channel}`}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                {lang === "zh" ? "待定" : "TBC"}
              </span>
            )}
          </div>

          {/* Confidence badge + staleness */}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <ConfidenceBadge confidence={match.confidence} lang={lang} />
            {stale && (
              <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-xs text-orange-600 ring-1 ring-orange-500/20 ring-inset dark:bg-orange-950 dark:text-orange-400 dark:ring-orange-500/30">
                {lang === "zh" ? "資料可能過時" : "May be outdated"}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
