"use server";

import type { InvalidationResult } from "@/lib/types";

export async function triggerCacheInvalidation(): Promise<InvalidationResult> {
  const secret = process.env.REVALIDATION_SECRET;
  if (!secret) {
    return { success: false, error: "REVALIDATION_SECRET not configured" };
  }

  // Call the public site's revalidation endpoint
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const res = await fetch(
    `${baseUrl}/api/revalidate?secret=${encodeURIComponent(secret)}`,
    { method: "POST" },
  );

  if (!res.ok) {
    return { success: false, error: `Revalidation failed: ${res.status}` };
  }

  const data = await res.json();
  return {
    success: data.revalidated ?? true,
    timestamp: new Date().toISOString(),
  };
}
