"use client";

import { useState } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/react";

export interface ComboboxOption {
  id: string;
  label: string;
}

interface SearchableComboboxProps {
  options: ComboboxOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  label: string;
}

export function SearchableCombobox({
  options,
  value,
  onChange,
  placeholder = "Search…",
  label,
}: SearchableComboboxProps) {
  const [query, setQuery] = useState("");

  const filtered =
    query === ""
      ? options
      : options.filter((opt) =>
          opt.label.toLowerCase().includes(query.toLowerCase()),
        );

  const selected = options.find((o) => o.id === value) ?? null;

  return (
    <Combobox
      value={selected}
      onChange={(opt) => onChange(opt?.id ?? null)}
      onClose={() => setQuery("")}
    >
      <div className="relative">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          <ComboboxInput
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            displayValue={(opt: ComboboxOption | null) => opt?.label ?? ""}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center px-2">
            <span className="text-gray-400 text-xs">▼</span>
          </ComboboxButton>
        </div>
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
                {opt.label}
              </ComboboxOption>
            ))
          )}
        </ComboboxOptions>
      </div>
    </Combobox>
  );
}
