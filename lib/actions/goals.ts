"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";
import type { Pillar } from "@/lib/supabase/types";

const PILLARS: Pillar[] = ["word", "prayer", "brotherhood", "growth"];

function refresh(goalId?: string) {
  revalidatePath("/today");
  revalidatePath("/growth", "layout");
  if (goalId) revalidatePath(`/growth/goals/${goalId}`);
}

export interface GoalFormState { error?: string; ok?: boolean }

export async function createGoal(_prev: GoalFormState, formData: FormData): Promise<GoalFormState> {
  const { supabase, userId } = await requireSession();
  const title = String(formData.get("title") ?? "").trim();
  const why = String(formData.get("why") ?? "").trim() || null;
  const pillar = String(formData.get("pillar") ?? "") as Pillar;
  const due = String(formData.get("due_date") ?? "") || null;
  const stepsRaw = String(formData.get("steps") ?? "");
  if (title.length < 3) return { error: "Name the goal." };
  if (!PILLARS.includes(pillar)) return { error: "Pick a pillar." };

  const { data: goal, error } = await supabase.from("goals").insert({ user_id: userId, title, why, pillar, due_date: due }).select("id").single();
  if (error || !goal) return { error: "Couldn't save the goal." };

  const steps = stepsRaw.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 20);
  if (steps.length) {
    await supabase.from("goal_steps").insert(steps.map((title, i) => ({ goal_id: goal.id, user_id: userId, title, sort_order: i + 1 })));
  }
  refresh();
  return { ok: true };
}

export async function addStep(goalId: string, title: string): Promise<void> {
  const clean = title.trim();
  if (!clean) return;
  const { supabase, userId } = await requireSession();
  const { count } = await supabase.from("goal_steps").select("id", { count: "exact", head: true }).eq("goal_id", goalId);
  await supabase.from("goal_steps").insert({ goal_id: goalId, user_id: userId, title: clean, sort_order: (count ?? 0) + 1 });
  refresh(goalId);
}

export async function toggleStep(stepId: string, goalId: string, done: boolean): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("goal_steps").update({ done_at: done ? new Date().toISOString() : null }).eq("id", stepId).eq("user_id", userId);
  refresh(goalId);
}

export async function deleteStep(stepId: string, goalId: string): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("goal_steps").delete().eq("id", stepId).eq("user_id", userId);
  refresh(goalId);
}

export async function setGoalStatus(goalId: string, status: "active" | "done" | "archived"): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("goals").update({ status, completed_at: status === "done" ? new Date().toISOString() : null }).eq("id", goalId).eq("user_id", userId);
  refresh(goalId);
}
