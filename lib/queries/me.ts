import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { habitsWithLogs, streakInfo } from "./habits";
import { BADGES } from "@/lib/data/distinctions";
import type { MemberStats } from "@/lib/data/merch";

type Client = SupabaseClient<Database>;

export type FullStats = MemberStats & { posts: number; journalDays: number; goalsDone: number };

export async function memberStats(supabase: Client, userId: string, today: string): Promise<FullStats> {
  const habits = await habitsWithLogs(supabase, userId, today, today);
  const [streak, { count: versesMastered }, { count: posts }, { data: journal }, { count: goalsDone }] = await Promise.all([
    streakInfo(supabase, userId, today, habits.filter((h) => h.target_per_week === 7).map((h) => h.id), 365),
    supabase.from("memory_progress").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "mastered"),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", userId),
    supabase.from("journal_entries").select("entry_date").eq("user_id", userId),
    supabase.from("goals").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "done"),
  ]);
  return {
    habitCompletions: streak.completions,
    perfectDays: streak.perfectDays,
    currentStreak: streak.current,
    versesMastered: versesMastered ?? 0,
    posts: posts ?? 0,
    journalDays: new Set((journal ?? []).map((j) => j.entry_date)).size,
    goalsDone: goalsDone ?? 0,
  };
}

/** Badges earned right now; newly earned ones are recorded so the date sticks. */
export async function syncDistinctions(supabase: Client, userId: string, stats: FullStats): Promise<Map<string, string>> {
  const { data: have } = await supabase.from("distinctions").select("badge, earned_at").eq("user_id", userId);
  const earned = new Map((have ?? []).map((d) => [d.badge, d.earned_at]));
  const fresh = BADGES.filter((b) => !earned.has(b.key) && b.earned(stats));
  if (fresh.length) {
    const now = new Date().toISOString();
    await supabase.from("distinctions").insert(fresh.map((b) => ({ user_id: userId, badge: b.key, earned_at: now })));
    for (const b of fresh) earned.set(b.key, now);
  }
  return earned;
}
