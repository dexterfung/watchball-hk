import { formatDateHKT, getTodayHKT } from "@/lib/date";

interface DateNavigatorProps {
  currentDate: string; // YYYY-MM-DD
}

const MAX_FORWARD_DAYS = 7;

function addDays(dateString: string, days: number): string {
  const [y, m, d] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  const ry = date.getUTCFullYear();
  const rm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const rd = String(date.getUTCDate()).padStart(2, "0");
  return `${ry}-${rm}-${rd}`;
}

export function DateNavigator({ currentDate }: DateNavigatorProps) {
  const today = getTodayHKT();
  const maxDate = addDays(today, MAX_FORWARD_DAYS);

  const isAtStart = currentDate <= today;
  const isAtEnd = currentDate >= maxDate;

  const prevDate = addDays(currentDate, -1);
  const nextDate = addDays(currentDate, 1);

  return (
    <nav
      className="flex items-center justify-between gap-2 rounded-lg bg-white p-3 shadow-sm border border-gray-200"
      aria-label="日期導航"
    >
      {isAtStart ? (
        <span
          aria-disabled="true"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-gray-700 opacity-30 cursor-not-allowed"
        >
          ‹
        </span>
      ) : (
        <a
          href={`/?date=${prevDate}`}
          aria-label="前一日"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-gray-700 hover:bg-gray-100"
        >
          ‹
        </a>
      )}

      <div className="text-center">
        <p className="text-base font-semibold text-gray-900">
          {formatDateHKT(currentDate)}
        </p>
        {currentDate === today && (
          <p className="text-xs text-blue-600">今日</p>
        )}
      </div>

      {isAtEnd ? (
        <span
          aria-disabled="true"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-gray-700 opacity-30 cursor-not-allowed"
        >
          ›
        </span>
      ) : (
        <a
          href={`/?date=${nextDate}`}
          aria-label="後一日"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-gray-700 hover:bg-gray-100"
        >
          ›
        </a>
      )}
    </nav>
  );
}
