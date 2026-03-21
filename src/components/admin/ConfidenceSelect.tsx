"use client";

interface ConfidenceSelectProps {
  value: "confirmed" | "unconfirmed" | "estimated";
  onChange: (value: "confirmed" | "unconfirmed" | "estimated") => void;
}

const OPTIONS = [
  { value: "confirmed" as const, label: "Confirmed" },
  { value: "unconfirmed" as const, label: "Unconfirmed" },
  { value: "estimated" as const, label: "Estimated" },
];

export function ConfidenceSelect({ value, onChange }: ConfidenceSelectProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Confidence
      </label>
      <select
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value as "confirmed" | "unconfirmed" | "estimated",
          )
        }
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
