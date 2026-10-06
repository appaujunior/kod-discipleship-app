"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import type { Pillar } from "@/lib/supabase/types";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const PILLARS: Pillar[] = ["word", "prayer", "brotherhood", "growth"];

function refresh() {
  revalidatePath("/today");
  revalidatePath("/growth");
  revalidatePath("/me");
}

/** Flip one habit's completion for a date. Returns the new state. */
export async function toggleHabit(habitId: string, date: string): Promise<{ done: boolean }> {
  if (!DATE_RE.test(date)) throw new Error("Bad date");
  const { supabase, userId } = await requireSession();
  const { data: existing } = await supabase
    .from("habit_logs")
    .select("id")
    .eq("habit_id", habitId)
    .eq("user_id", userId)
    .eq("log_date", date)
    .maybeSingle();
  if (existing) {
    await supabase.from("habit_logs").delete().eq("id", existing.id);
    refresh();
    return { done: false };
  }
  await supabase.from("habit_logs").insert({ habit_id: habitId, user_id: userId, log_date: date });
  refresh();
  return { done: true };
}

export interface HabitFormState {
  error?: string;
  ok?: boolean;
}

export async function createHabit(_prev: HabitFormState, formData: FormData): Promise<HabitFormState> {
  const { supabase, userId } = await requireSession();
  const title = String(formData.get("title") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim() || null;
  const pillar = String(formData.get("pillar") ?? "") as Pillar;
  const target = Number(formData.get("target") ?? 7);
  if (title.length < 2) return { error: "Give the habit a name." };
  if (!PILLARS.includes(pillar)) return { error: "Pick a pillar." };
  if (!(target >= 1 && target <= 7)) return { error: "Target must be 1 to 7 days a week." };

  const { count } = await supabase.from("habits").select("id", { count: "exact", head: true }).eq("user_id", userId);
  const { error } = await supabase.from("habits").insert({ user_id: userId, title, detail, pillar, target_per_week: target, sort_order: (count ?? 0) + 1 });
  if (error) return { error: "Couldn't save that habit." };
  refresh();
  return { ok: true };
}

export async function archiveHabit(habitId: string): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("habits").update({ archived: true }).eq("id", habitId).eq("user_id", userId);
  refresh();
}
