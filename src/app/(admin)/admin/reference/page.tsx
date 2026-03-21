import { ReferenceManager } from "@/components/admin/ReferenceManager";
import { fetchReferenceData } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function ReferencePage() {
  const data = await fetchReferenceData();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Reference Data
      </h2>
      <ReferenceManager data={data} />
    </div>
  );
}
