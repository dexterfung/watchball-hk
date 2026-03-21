"use client";

import type { MatchEntry } from "@/lib/types";

interface MatchListProps {
  matches: MatchEntry[];
  onEdit?: (match: MatchEntry) => void;
  onCopyForward?: (matchId: string) => void;
  onDelete?: (match: MatchEntry) => void;
}

export function MatchList({
  matches,
  onEdit,
  onCopyForward,
  onDelete,
}: MatchListProps) {
  if (matches.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        No matches for the selected date range.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {matches.map((match) => {
        const time = match.kickOffHKT.slice(11, 16);
        return (
          <div
            key={match.id}
            className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono text-gray-500">{time}</span>
                <span className="font-medium">
                  {match.homeTeam.nameZh} vs {match.awayTeam.nameZh}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                <span>{match.competition.nameZh}</span>
                {match.broadcasters.length > 0 && (
                  <>
                    <span>·</span>
                    <span>
                      {match.broadcasters.map((b) => b.name).join(", ")}
                    </span>
                  </>
                )}
                {match.confidence !== "confirmed" && (
                  <>
                    <span>·</span>
                    <span className="rounded bg-yellow-100 px-1 text-yellow-700">
                      {match.confidence}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="ml-2 flex shrink-0 gap-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(match)}
                  className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                >
                  Edit
                </button>
              )}
              {onCopyForward && (
                <button
                  onClick={() => onCopyForward(match.id)}
                  className="rounded px-2 py-1 text-xs text-green-600 hover:bg-green-50"
                >
                  Copy
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(match)}
                  className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
