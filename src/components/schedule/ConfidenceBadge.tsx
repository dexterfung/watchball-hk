import type { MatchEntry } from "@/lib/types";

interface ConfidenceBadgeProps {
  confidence: MatchEntry["confidence"];
}

export function ConfidenceBadge({ confidence }: ConfidenceBadgeProps) {
  if (confidence === "confirmed") return null;

  return (
    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-amber-600/20 ring-inset dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-500/30">
      待確認
    </span>
  );
}
