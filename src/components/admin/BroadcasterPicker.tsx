"use client";

import { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";
import type { BroadcasterSelection } from "@/lib/types";

interface Option {
  id: string;
  label: string;
  type: "tv" | "ott";
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
  const [query, setQuery] = useState("");

  const selectedIds = value.map((v) => v.broadcasterId);

  const filtered =
    query === ""
      ? options
      : options.filter((opt) =>
          opt.label.toLowerCase().includes(query.toLowerCase()),
        );

  function handleSelect(opts: Option[]) {
    const newIds = opts.map((o) => o.id);
    // Keep existing selections with their channels, add new ones
    const updated: BroadcasterSelection[] = newIds.map((id) => {
      const existing = value.find((v) => v.broadcasterId === id);
      return existing ?? { broadcasterId: id };
    });
    onChange(updated);
  }

  function handleRemove(id: string) {
    onChange(value.filter((v) => v.broadcasterId !== id));
  }

  function handleChannelChange(broadcasterId: string, channel: string) {
    onChange(
      value.map((v) =>
        v.broadcasterId === broadcasterId ? { ...v, channel } : v,
      ),
    );
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && query === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  const selectedOptions = options.filter((o) => selectedIds.includes(o.id));

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        Broadcasters
      </label>

      {/* Selected broadcasters with channel inputs */}
      {value.length > 0 && (
        <div className="mb-2 space-y-1.5">
          {value.map((sel) => {
            const opt = options.find((o) => o.id === sel.broadcasterId);
            if (!opt) return null;
            return (
              <div
                key={sel.broadcasterId}
                className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5"
              >
                <span className="text-sm font-medium text-gray-800">
                  {opt.label}
                </span>
                {opt.type === "tv" && (
                  <input
                    type="text"
                    value={sel.channel ?? ""}
                    onChange={(e) =>
                      handleChannelChange(sel.broadcasterId, e.target.value)
                    }
                    placeholder="Channel #"
                    className="w-24 rounded border border-gray-300 px-2 py-0.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(sel.broadcasterId)}
                  className="ml-auto text-sm text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Combobox for adding broadcasters */}
      <Combobox
        multiple
        value={selectedOptions}
        onChange={handleSelect}
        onClose={() => setQuery("")}
      >
        <ComboboxInput
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? "Search broadcasters…" : "Add more…"}
        />
        <ComboboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No results found
            </div>
          ) : (
            filtered.map((opt) => (
              <ComboboxOption
                key={opt.id}
                value={opt}
                className="cursor-pointer px-3 py-2 text-sm data-[focus]:bg-blue-50 data-[selected]:font-medium data-[selected]:text-blue-700"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`inline-block h-4 w-4 rounded border text-center text-xs leading-4 ${
                      selectedIds.includes(opt.id)
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedIds.includes(opt.id) ? "✓" : ""}
                  </span>
                  {opt.label}
                </span>
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
