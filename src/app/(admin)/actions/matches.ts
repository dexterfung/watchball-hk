"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type {
  CreateMatchInput,
  CreateMatchResult,
  UpdateMatchInput,
  UpdateMatchResult,
  DeleteMatchInput,
  DeleteMatchResult,
} from "@/lib/types";

async function getAuthenticatedClient() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase: null, error: "Unauthorized" };
  }

  return { supabase, error: null };
}

export async function createMatch(
  input: CreateMatchInput,
): Promise<CreateMatchResult> {
  const { supabase, error: authError } = await getAuthenticatedClient();
  if (!supabase) return { success: false, error: authError! };

  // Convert HKT date+time to UTC
  const kickOffUTC = new Date(
    `${input.kickOffDate}T${input.kickOffTime}:00+08:00`,
  ).toISOString();

  // Check for duplicates
  const { data: existing } = await supabase
    .from("matches")
    .select("id")
    .eq("home_team_id", input.homeTeamId)
    .eq("away_team_id", input.awayTeamId)
    .eq("kick_off_utc", kickOffUTC)
    .maybeSingle();

  // Insert match
  const { data: match, error: insertError } = await supabase
    .from("matches")
    .insert({
      kick_off_utc: kickOffUTC,
      home_team_id: input.homeTeamId,
      away_team_id: input.awayTeamId,
      competition_id: input.competitionId,
      confidence: input.confidence,
      source_type: "manual",
      last_updated: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Insert broadcaster links
  if (input.broadcasters.length > 0) {
    const { error: bcError } = await supabase
      .from("match_broadcasters")
      .insert(
        input.broadcasters.map((b) => ({
          match_id: match.id,
          broadcaster_id: b.broadcasterId,
          channel: b.channel || null,
        })),
      );

    if (bcError) {
      return { success: false, error: bcError.message };
    }
  }

  const result: CreateMatchResult = { success: true, match: { id: match.id } };

  if (existing) {
    result.duplicateWarning = {
      existingMatchId: existing.id,
      message: `A match with the same teams and kick-off time already exists.`,
    };
  }

  return result;
}

export async function updateMatch(
  input: UpdateMatchInput,
): Promise<UpdateMatchResult> {
  const { supabase, error: authError } = await getAuthenticatedClient();
  if (!supabase) return { success: false, error: authError! };

  // Build update object
  const updates: Record<string, unknown> = {
    last_updated: new Date().toISOString(),
  };

  if (input.kickOffDate && input.kickOffTime) {
    updates.kick_off_utc = new Date(
      `${input.kickOffDate}T${input.kickOffTime}:00+08:00`,
    ).toISOString();
  }
  if (input.homeTeamId) updates.home_team_id = input.homeTeamId;
  if (input.awayTeamId) updates.away_team_id = input.awayTeamId;
  if (input.competitionId) updates.competition_id = input.competitionId;
  if (input.confidence) updates.confidence = input.confidence;

  const { error: updateError } = await supabase
    .from("matches")
    .update(updates)
    .eq("id", input.matchId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Replace broadcasters if provided
  if (input.broadcasters !== undefined) {
    await supabase
      .from("match_broadcasters")
      .delete()
      .eq("match_id", input.matchId);

    if (input.broadcasters.length > 0) {
      const { error: bcError } = await supabase
        .from("match_broadcasters")
        .insert(
          input.broadcasters.map((b) => ({
            match_id: input.matchId,
            broadcaster_id: b.broadcasterId,
            channel: b.channel || null,
          })),
        );

      if (bcError) {
        return { success: false, error: bcError.message };
      }
    }
  }

  return { success: true };
}

export async function deleteMatch(
  input: DeleteMatchInput,
): Promise<DeleteMatchResult> {
  const { supabase, error: authError } = await getAuthenticatedClient();
  if (!supabase) return { success: false, error: authError! };

  const { error } = await supabase
    .from("matches")
    .delete()
    .eq("id", input.matchId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
