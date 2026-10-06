import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { PLANS, planBySlug, planDay, dayLabel, type ReadingPlan } from "@/lib/bible/plans";
import type { Passage } from "@/lib/bible/refs";

type Client = SupabaseClient<Database>;

export interface NextReading {
  plan: ReadingPlan;
  dayNumber: number;
  label: string;
  passages: Passage[];
  completed: number;
  /** True when every reading in the plan is done. */
  finished: boolean;
}

/** For each plan the member has joined: the next unread day and progress. */
export async function nextReadings(supabase: Client, userId: string): Promise<NextReading[]> {
  const [{ data: joined }, { data: progress }] = await Promise.all([
    supabase.from("user_plans").select("plan_slug, started_on").eq("user_id", userId).order("started_on"),
    supabase.from("plan_progress").select("plan_slug, day_number").eq("user_id", userId),
  ]);
  const doneBy = new Map<string, Set<number>>();
  for (const p of progress ?? []) {
    if (!doneBy.has(p.plan_slug)) doneBy.set(p.plan_slug, new Set());
    doneBy.get(p.plan_slug)!.add(p.day_number);
  }
  const out: NextReading[] = [];
  for (const j of joined ?? []) {
    const plan = planBySlug(j.plan_slug);
    if (!plan) continue;
    const done = doneBy.get(plan.slug) ?? new Set<number>();
    let next = 1;
    while (next <= plan.days && done.has(next)) next += 1;
    const finished = next > plan.days;
    const dayNumber = finished ? plan.days : next;
    out.push({ plan, dayNumber, label: dayLabel(plan, dayNumber), passages: planDay(plan, dayNumber), completed: done.size, finished });
  }
  return out;
}

export function allPlans(): ReadingPlan[] {
  return PLANS;
}
