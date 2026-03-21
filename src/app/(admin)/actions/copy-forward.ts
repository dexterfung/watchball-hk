"use server";

import { getCopyForwardData } from "@/lib/admin";

export async function copyForwardMatch(matchId: string) {
  return getCopyForwardData(matchId);
}
