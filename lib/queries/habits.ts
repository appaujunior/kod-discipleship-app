import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, HabitRow } from "@/lib/supabase/types";
import { parseDateOnly, toDateOnly } from "@/lib/utils";

type Client = SupabaseClient<Database>;

export interface HabitWithLogs extends HabitRow {
  /** Dates (YYYY-MM-DD) this habit was completed within the requested window. */
  doneOn: Set<string>;
}

/** Active habits plus their completions between two dates (inclusive). */
export async function habitsWithLogs(supabase: Client, userId: string, from: string, to: string): Promise<HabitWithLogs[]> {
  const [{ data: habits }, { data: logs }] = await Promise.all([
    supabase.from("habits").select("*").eq("user_id", userId).eq("archived", false).order("sort_order"),
    supabase.from("habit_logs").select("habit_id, log_date").eq("user_id", userId).gte("log_date", from).lte("log_date", to),
  ]);
  const byHabit = new Map<string, Set<string>>();
  for (const l of logs ?? []) {
    if (!byHabit.has(l.habit_id)) byHabit.set(l.habit_id, new Set());
    byHabit.get(l.habit_id)!.add(l.log_date);
  }
  return (habits ?? []).map((h) => ({ ...h, doneOn: byHabit.get(h.id) ?? new Set() }));
}

/** The seven days ending on `today`, oldest first. */
export function weekEnding(today: string): string[] {
  const end = parseDateOnly(today);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(end);
    d.setDate(end.getDate() - (6 - i));
    return toDateOnly(d);
  });
}

export interface StreakInfo {
  /** Consecutive days (ending today or yesterday) with at least one habit completed. */
  current: number;
  /** Days in the window where every daily habit was completed. */
  perfectDays: number;
  /** Total completions in the window. */
  completions: number;
}

/**
 * Streak and perfect-day stats from a longer log window.
 * `dailyHabitIds` are habits whose target is 7/week; a "perfect day" completes all of them.
 */
export async function streakInfo(supabase: Client, userId: string, today: string, dailyHabitIds: string[], windowDays = 120): Promise<StreakInfo> {
  const start = parseDateOnly(today);
  start.setDate(start.getDate() - windowDays);
  const { data: logs } = await supabase
    .from("habit_logs")
    .select("habit_id, log_date")
    .eq("user_id", userId)
    .gte("log_date", toDateOnly(start))
    .lte("log_date", today);

  const perDay = new Map<string, Set<string>>();
  for (const l of logs ?? []) {
    if (!perDay.has(l.log_date)) perDay.set(l.log_date, new Set());
    perDay.get(l.log_date)!.add(l.habit_id);
  }

  let current = 0;
  const cursor = parseDateOnly(today);
  // A streak survives until the end of today, so start counting from yesterday if today is still empty.
  if (!perDay.has(today)) cursor.setDate(cursor.getDate() - 1);
  while (perDay.has(toDateOnly(cursor))) {
    current += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  let perfectDays = 0;
  if (dailyHabitIds.length > 0) {
    for (const done of perDay.values()) {
      if (dailyHabitIds.every((id) => done.has(id))) perfectDays += 1;
    }
  }
  return { current, perfectDays, completions: logs?.length ?? 0 };
}
