import { AdminDashboard } from "./AdminDashboard";
import { fetchReferenceData, fetchAdminMatches } from "@/lib/admin";
import { getTodayHKT } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const today = getTodayHKT();
  // Default: show today + next 7 days
  const endDate = (() => {
    const d = new Date(today + "T00:00:00+08:00");
    d.setDate(d.getDate() + 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  })();

  const [referenceData, matches] = await Promise.all([
    fetchReferenceData(),
    fetchAdminMatches(today, endDate),
  ]);

  return (
    <AdminDashboard
      initialMatches={matches}
      referenceData={referenceData}
      defaultStartDate={today}
      defaultEndDate={endDate}
    />
  );
}
