import type { MatchEntry } from "@/lib/types";
import { formatTimeHKT } from "@/lib/date";
import { ConfidenceBadge } from "./ConfidenceBadge";

interface MatchCardProps {
  match: MatchEntry;
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

export function MatchCard({ match }: MatchCardProps) {
  const time = formatTimeHKT(match.kickOffHKT);
  const stale = isStale(match.lastUpdated);

  return (
    <article className={`rounded-lg border p-4 shadow-sm ${stale ? "border-orange-200 bg-orange-50/50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-start gap-3">
        {/* Kick-off time */}
        <div className="flex-shrink-0 text-center">
          <time className="text-xl font-bold tabular-nums text-gray-900">
            {time}
          </time>
          <p className="text-xs text-gray-500">HKT</p>
        </div>

        {/* Match details */}
        <div className="min-w-0 flex-1">
          {/* Teams */}
          <p className="text-base font-medium text-gray-900">
            {match.homeTeam.nameZh}
            {match.homeTeam.nameEn && (
              <span className="ml-1 text-xs font-normal text-gray-400">{match.homeTeam.nameEn}</span>
            )}
            <span className="mx-1.5 text-xs font-normal text-gray-400">vs</span>
            {match.awayTeam.nameZh}
            {match.awayTeam.nameEn && (
              <span className="ml-1 text-xs font-normal text-gray-400">{match.awayTeam.nameEn}</span>
            )}
          </p>

          {/* Competition */}
          <p className="mt-1.5 text-sm text-gray-600">
            {match.competition.nameZh}
            {match.competition.nameEn && (
              <span className="ml-1 text-xs text-gray-400">
                {match.competition.nameEn}
              </span>
            )}
          </p>

          {/* Broadcasters */}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {match.broadcasters.length > 0 ? (
              match.broadcasters.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                >
                  {b.name}
                </span>
              ))
            ) : (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-500">
                待定
              </span>
            )}
          </div>

          {/* Confidence badge + staleness */}
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <ConfidenceBadge confidence={match.confidence} />
            {stale && (
              <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-0.5 text-xs text-orange-600 ring-1 ring-orange-500/20 ring-inset">
                資料可能過時
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

