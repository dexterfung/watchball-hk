"use client";

import { useState } from "react";
import { triggerCacheInvalidation } from "@/app/(admin)/actions/revalidate";

export function CacheInvalidateButton() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  async function handleClick() {
    setLoading(true);
    setStatus("idle");

    const result = await triggerCacheInvalidation();
    setStatus(result.success ? "success" : "error");
    setLoading(false);

    // Auto-clear status after 3 seconds
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
        status === "success"
          ? "bg-green-100 text-green-700"
          : status === "error"
            ? "bg-red-100 text-red-700"
            : "bg-blue-600 text-white hover:bg-blue-700"
      } disabled:opacity-50`}
    >
      {loading
        ? "Publishing…"
        : status === "success"
          ? "Published!"
          : status === "error"
            ? "Failed — Retry"
            : "Publish Changes"}
    </button>
  );
}
