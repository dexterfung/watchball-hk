"use client";

import { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";

interface Option {
  id: string;
  label: string;
}

interface MultiSelectComboboxProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  label: string;
}

export function MultiSelectCombobox({
  options,
  value,
  onChange,
  placeholder = "Search…",
  label,
}: MultiSelectComboboxProps) {
  const [query, setQuery] = useState("");

  const selectedOptions = options.filter((o) => value.includes(o.id));

  const filtered =
    query === ""
      ? options
      : options.filter((opt) =>
          opt.label.toLowerCase().includes(query.toLowerCase()),
        );

  function handleChange(opts: Option[]) {
    onChange(opts.map((o) => o.id));
  }

  function removeItem(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && query === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <Combobox
      multiple
      value={selectedOptions}
      onChange={handleChange}
      onClose={() => setQuery("")}
    >
      <div className="relative">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
        {selectedOptions.length > 0 && (
          <div className="mb-1 flex flex-wrap gap-1">
            {selectedOptions.map((opt) => (
              <span
                key={opt.id}
                className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
              >
                {opt.label}
                <button
                  type="button"
                  onClick={() => removeItem(opt.id)}
                  className="hover:text-blue-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <ComboboxInput
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={selectedOptions.length === 0 ? placeholder : ""}
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
                      value.includes(opt.id)
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-300"
                    }`}
                  >
                    {value.includes(opt.id) ? "✓" : ""}
                  </span>
                  {opt.label}
                </span>
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
