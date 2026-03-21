"use client";

import { useEffect, useRef } from "react";
import type { MatchEntry } from "@/lib/types";

interface DeleteConfirmDialogProps {
  match: MatchEntry;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  match,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onCancel();
    }
  }

  const time = match.kickOffHKT.slice(11, 16);
  const date = match.kickOffHKT.slice(0, 10);

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-50 rounded-lg border border-gray-200 bg-white p-6 shadow-xl backdrop:bg-black/50"
    >
      <h3 className="mb-3 text-lg font-semibold text-gray-900">
        Delete Match?
      </h3>
      <div className="mb-4 rounded-md bg-gray-50 p-3 text-sm">
        <p className="font-medium">
          {match.homeTeam.nameZh} vs {match.awayTeam.nameZh}
        </p>
        <p className="text-gray-600">
          {date} {time} HKT · {match.competition.nameZh}
        </p>
      </div>
      <p className="mb-4 text-sm text-gray-600">
        This action cannot be undone. The match and all broadcaster assignments
        will be permanently deleted.
      </p>
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          autoFocus
          className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </dialog>
  );
}
