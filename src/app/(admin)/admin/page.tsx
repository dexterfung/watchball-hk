import { AdminDashboard } from "./AdminDashboard";
import { fetchReferenceData, fetchAdminMatches } from "@/lib/admin";
import { getTodayHKT } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const today = getTodayHKT();
  // Default: show today + next 7 days
  const endDate = (() => {
    const [y, m, d] = today.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d + 7));
    const ry = date.getUTCFullYear();
    const rm = String(date.getUTCMonth() + 1).padStart(2, "0");
    const rd = String(date.getUTCDate()).padStart(2, "0");
    return `${ry}-${rm}-${rd}`;
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
