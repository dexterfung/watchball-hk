"use client";

interface DateTimePickerProps {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

export function DateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
}: DateTimePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Date (HKT)
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Time (HKT, 24h)
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
