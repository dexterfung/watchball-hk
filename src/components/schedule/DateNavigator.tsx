"use client";

import Link from "next/link";
import { formatDateHKT, getTodayHKT } from "@/lib/date";
import { useLanguage } from "./LanguageProvider";

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

function formatDateEN(dateString: string): string {
  const date = new Date(dateString + "T00:00:00+08:00");
  return new Intl.DateTimeFormat("en-HK", {
    timeZone: "Asia/Hong_Kong",
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function DateNavigator({ currentDate }: DateNavigatorProps) {
  const { lang } = useLanguage();
  const today = getTodayHKT();
  const maxDate = addDays(today, MAX_FORWARD_DAYS);

  const isAtStart = currentDate <= today;
  const isAtEnd = currentDate >= maxDate;

  const prevDate = addDays(currentDate, -1);
  const nextDate = addDays(currentDate, 1);

  const dateDisplay =
    lang === "zh" ? formatDateHKT(currentDate) : formatDateEN(currentDate);
  const todayLabel = lang === "zh" ? "今日" : "Today";

  return (
    <nav
      className="flex items-center justify-between gap-2 rounded-lg bg-white p-3 shadow-sm border border-gray-200 dark:border-gray-700 dark:bg-gray-800"
      aria-label={lang === "zh" ? "日期導航" : "Date navigation"}
    >
      {isAtStart ? (
        <span
          aria-disabled="true"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-gray-700 dark:text-gray-300 opacity-30 cursor-not-allowed"
        >
          ‹
        </span>
      ) : (
        <Link
          href={`/?date=${prevDate}`}
          aria-label={lang === "zh" ? "前一日" : "Previous day"}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          ‹
        </Link>
      )}

      <div className="text-center">
        <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {dateDisplay}
        </p>
        {currentDate === today && (
          <p className="text-xs text-blue-600">{todayLabel}</p>
        )}
      </div>

      {isAtEnd ? (
        <span
          aria-disabled="true"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-gray-700 dark:text-gray-300 opacity-30 cursor-not-allowed"
        >
          ›
        </span>
      ) : (
        <Link
          href={`/?date=${nextDate}`}
          aria-label={lang === "zh" ? "後一日" : "Next day"}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-lg font-bold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          ›
        </Link>
      )}
    </nav>
  );
}
