"use client";

import { useRouter } from "next/navigation";
import { formatDateHKT, getTodayHKT } from "@/lib/date";

interface DateNavigatorProps {
  currentDate: string; // YYYY-MM-DD
}

const MAX_FORWARD_DAYS = 7;

function addDays(dateString: string, days: number): string {
  const date = new Date(dateString + "T00:00:00+08:00");
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DateNavigator({ currentDate }: DateNavigatorProps) {
  const router = useRouter();
  const today = getTodayHKT();
  const maxDate = addDays(today, MAX_FORWARD_DAYS);

  const isAtStart = currentDate <= today;
  const isAtEnd = currentDate >= maxDate;

  function navigate(direction: -1 | 1) {
    const newDate = addDays(currentDate, direction);
    router.push(`/?date=${newDate}`);
  }

  return (
    <nav
      className="flex items-center justify-between gap-2 rounded-lg bg-white p-3 shadow-sm border border-gray-200"
      aria-label="日期導航"
    >
      <button
        onClick={() => navigate(-1)}
        disabled={isAtStart}
        aria-label="前一日"
        className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ‹
      </button>

      <div className="text-center">
        <p className="text-base font-semibold text-gray-900">
          {formatDateHKT(currentDate)}
        </p>
        {currentDate === today && (
          <p className="text-xs text-blue-600">今日</p>
        )}
      </div>

      <button
        onClick={() => navigate(1)}
        disabled={isAtEnd}
        aria-label="後一日"
        className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ›
      </button>
    </nav>
  );
}
