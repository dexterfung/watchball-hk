const HKT_TIMEZONE = "Asia/Hong_Kong";

/**
 * Format a UTC date string to HKT time display (e.g., "20:00")
 */
export function formatTimeHKT(utcDateString: string): string {
  const date = new Date(utcDateString);
  return new Intl.DateTimeFormat("zh-HK", {
    timeZone: HKT_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Format a date string to HKT date display (e.g., "3月14日 星期五")
 */
export function formatDateHKT(dateString: string): string {
  const date = new Date(dateString + "T00:00:00+08:00");
  return new Intl.DateTimeFormat("zh-HK", {
    timeZone: HKT_TIMEZONE,
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

/**
 * Convert a selected HKT date (YYYY-MM-DD) to a UTC range for Supabase query.
 * Returns { start, end } as ISO strings.
 *
 * HKT 00:00:00 = UTC previous day 16:00:00
 * HKT 23:59:59 = UTC same day 15:59:59
 */
export function getHKTDateRange(dateString: string): {
  start: string;
  end: string;
} {
  // Parse as HKT midnight
  const hktMidnight = new Date(dateString + "T00:00:00+08:00");
  const hktEndOfDay = new Date(dateString + "T23:59:59.999+08:00");

  return {
    start: hktMidnight.toISOString(),
    end: hktEndOfDay.toISOString(),
  };
}

/**
 * Get today's date in HKT as YYYY-MM-DD string.
 */
export function getTodayHKT(): string {
  const now = new Date();
  const hktParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: HKT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  // en-CA locale formats as YYYY-MM-DD
  return hktParts;
}

/**
 * Format a UTC ISO string to a full HKT ISO string for display.
 */
export function toHKTISOString(utcDateString: string): string {
  const date = new Date(utcDateString);
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: HKT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}+08:00`;
}
