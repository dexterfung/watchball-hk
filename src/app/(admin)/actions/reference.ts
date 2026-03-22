"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type {
  CreateReferenceInput,
  CreateReferenceResult,
  UpdateReferenceInput,
  UpdateReferenceResult,
  DeleteReferenceInput,
  DeleteReferenceResult,
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

export async function createReferenceItem(
  input: CreateReferenceInput,
): Promise<CreateReferenceResult> {
  const { supabase, error: authError } = await getAuthenticatedClient();
  if (!supabase) return { success: false, error: authError! };

  if (input.type === "competition") {
    const { data, error } = await supabase
      .from("competitions")
      .insert({
        name_zh: input.nameZh!,
        name_en: input.nameEn || null,
        short_name_zh: input.shortNameZh || null,
        sort_order: input.sortOrder ?? 0,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Duplicate name" };
      }
      return { success: false, error: error.message };
    }
    return { success: true, item: { id: data.id } };
  }

  if (input.type === "team") {
    const { data, error } = await supabase
      .from("teams")
      .insert({
        name_zh: input.nameZh!,
        name_en: input.nameEn || null,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Duplicate name" };
      }
      return { success: false, error: error.message };
    }
    return { success: true, item: { id: data.id } };
  }

  if (input.type === "broadcaster") {
    const { data, error } = await supabase
      .from("broadcasters")
      .insert({
        name: input.name!,
        type: input.broadcasterType!,
        sort_order: input.sortOrder ?? 0,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Duplicate name" };
      }
      return { success: false, error: error.message };
    }
    return { success: true, item: { id: data.id } };
  }

  if (input.type === "broadcaster_channel") {
    const { data, error } = await supabase
      .from("broadcaster_channels")
      .insert({
        broadcaster_id: input.broadcasterId!,
        name: input.name!,
        sort_order: input.sortOrder ?? 0,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return { success: false, error: "Duplicate channel name" };
      }
      return { success: false, error: error.message };
    }
    return { success: true, item: { id: data.id } };
  }

  return { success: false, error: "Invalid type" };
}

export async function updateReferenceItem(
  input: UpdateReferenceInput,
): Promise<UpdateReferenceResult> {
  const { supabase, error: authError } = await getAuthenticatedClient();
  if (!supabase) return { success: false, error: authError! };

  if (input.type === "competition") {
    const updates: Record<string, unknown> = {};
    if (input.nameZh !== undefined) updates.name_zh = input.nameZh;
    if (input.nameEn !== undefined) updates.name_en = input.nameEn || null;
    if (input.shortNameZh !== undefined) updates.short_name_zh = input.shortNameZh || null;
    if (input.sortOrder !== undefined) updates.sort_order = input.sortOrder;

    const { error } = await supabase
      .from("competitions")
      .update(updates)
      .eq("id", input.id);

    if (error) {
      if (error.code === "23505") return { success: false, error: "Duplicate name" };
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  if (input.type === "team") {
    const updates: Record<string, unknown> = {};
    if (input.nameZh !== undefined) updates.name_zh = input.nameZh;
    if (input.nameEn !== undefined) updates.name_en = input.nameEn || null;

    const { error } = await supabase
      .from("teams")
      .update(updates)
      .eq("id", input.id);

    if (error) {
      if (error.code === "23505") return { success: false, error: "Duplicate name" };
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  if (input.type === "broadcaster") {
    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.broadcasterType !== undefined) updates.type = input.broadcasterType;
    if (input.sortOrder !== undefined) updates.sort_order = input.sortOrder;

    const { error } = await supabase
      .from("broadcasters")
      .update(updates)
      .eq("id", input.id);

    if (error) {
      if (error.code === "23505") return { success: false, error: "Duplicate name" };
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  if (input.type === "broadcaster_channel") {
    const updates: Record<string, unknown> = {};
    if (input.name !== undefined) updates.name = input.name;
    if (input.sortOrder !== undefined) updates.sort_order = input.sortOrder;

    const { error } = await supabase
      .from("broadcaster_channels")
      .update(updates)
      .eq("id", input.id);

    if (error) {
      if (error.code === "23505") return { success: false, error: "Duplicate channel name" };
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  return { success: false, error: "Invalid type" };
}

export async function deleteReferenceItem(
  input: DeleteReferenceInput,
): Promise<DeleteReferenceResult> {
  const { supabase, error: authError } = await getAuthenticatedClient();
  if (!supabase) return { success: false, error: authError! };

  const table =
    input.type === "competition"
      ? "competitions"
      : input.type === "team"
        ? "teams"
        : input.type === "broadcaster_channel"
          ? "broadcaster_channels"
          : "broadcasters";

  // Check referential integrity
  if (input.type === "broadcaster_channel") {
    const { count } = await supabase
      .from("match_broadcasters")
      .select("id", { count: "exact", head: true })
      .eq("broadcaster_channel_id", input.id);
    if (count && count > 0) {
      return {
        success: false,
        error: `Referenced by ${count} matches`,
      };
    }
  } else if (input.type === "competition") {
    const { count } = await supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("competition_id", input.id);
    if (count && count > 0) {
      return {
        success: false,
        error: `Referenced by ${count} matches`,
      };
    }
  } else if (input.type === "team") {
    const { count: homeCount } = await supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("home_team_id", input.id);
    const { count: awayCount } = await supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("away_team_id", input.id);
    const total = (homeCount ?? 0) + (awayCount ?? 0);
    if (total > 0) {
      return {
        success: false,
        error: `Referenced by ${total} matches`,
      };
    }
  } else if (input.type === "broadcaster") {
    const { count } = await supabase
      .from("match_broadcasters")
      .select("match_id", { count: "exact", head: true })
      .eq("broadcaster_id", input.id);
    if (count && count > 0) {
      return {
        success: false,
        error: `Referenced by ${count} matches`,
      };
    }
  }

  const { error } = await supabase.from(table).delete().eq("id", input.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
