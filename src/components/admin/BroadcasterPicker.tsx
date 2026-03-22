"use client";

import type { BroadcasterSelection } from "@/lib/types";

interface Channel {
  id: string;
  name: string;
}

interface Option {
  id: string;
  label: string;
  type: "tv" | "ott";
  channels: Channel[];
}

interface BroadcasterPickerProps {
  options: Option[];
  value: BroadcasterSelection[];
  onChange: (value: BroadcasterSelection[]) => void;
}

export function BroadcasterPicker({
  options,
  value,
  onChange,
}: BroadcasterPickerProps) {
  function handleAdd() {
    onChange([...value, { broadcasterId: "" }]);
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleBroadcasterChange(index: number, broadcasterId: string) {
    const updated = value.map((v, i) =>
      i === index ? { broadcasterId, channelId: undefined } : v,
    );
    onChange(updated);
  }

  function handleChannelChange(index: number, channelId: string) {
    const updated = value.map((v, i) =>
      i === index ? { ...v, channelId: channelId || undefined } : v,
    );
    onChange(updated);
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Broadcasters
      </label>

      {value.length > 0 && (
        <div className="mb-2 space-y-2">
          {value.map((sel, index) => {
            const opt = options.find((o) => o.id === sel.broadcasterId);
            const channels = opt?.channels ?? [];

            return (
              <div
                key={index}
                className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5"
              >
                {/* Broadcaster select */}
                <select
                  value={sel.broadcasterId}
                  onChange={(e) =>
                    handleBroadcasterChange(index, e.target.value)
                  }
                  className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Select broadcaster…</option>
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>

                {/* Channel select — show if broadcaster has channels */}
                {opt && channels.length > 0 && (
                  <select
                    value={sel.channelId ?? ""}
                    onChange={(e) => handleChannelChange(index, e.target.value)}
                    className="w-32 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">No channel</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-sm text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="rounded-md border border-dashed border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:border-gray-400 hover:text-gray-800"
      >
        + Add Broadcaster
      </button>
    </div>
  );
}
