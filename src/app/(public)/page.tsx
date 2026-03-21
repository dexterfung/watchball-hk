import { getTodayHKT } from "@/lib/date";
import { fetchScheduleByDate } from "@/lib/schedule";
import { MatchList } from "@/components/schedule/MatchList";
import { DateNavigator } from "@/components/schedule/DateNavigator";

// On-demand revalidation only (no time-based)
export const revalidate = false;

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function SchedulePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const date = params.date ?? getTodayHKT();
  const data = await fetchScheduleByDate(date);

  return (
    <div className="flex flex-col gap-4">
      <DateNavigator currentDate={date} />
      <MatchList
        matches={data.matches}
        competitions={data.filters.competitions}
        teams={data.filters.teams}
      />
    </div>
  );
}
