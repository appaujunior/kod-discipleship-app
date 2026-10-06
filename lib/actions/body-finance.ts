"use server";

import { revalidatePath } from "next/cache";
import { requireSession, isMentor } from "@/lib/auth";
import { workoutBySlug } from "@/lib/data/workouts";
import { SPENDING_CATEGORIES, MONEY_PROMPTS } from "@/lib/data/finance";

export interface SimpleState { error?: string; ok?: boolean }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Log a library workout (by slug) or a custom one (by id). The title is snapshotted onto the log. */
export async function logWorkout(slug: string, date: string): Promise<void> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Bad date");
  const { supabase, userId } = await requireSession();
  let title = workoutBySlug(slug)?.title;
  if (!title && UUID.test(slug)) {
    const { data } = await supabase.from("custom_workouts").select("title").eq("id", slug).maybeSingle();
    title = data?.title;
  }
  if (!title) throw new Error("Bad workout");
  await supabase.from("workout_logs").insert({ user_id: userId, workout_slug: slug, title, done_on: date });
  revalidatePath("/growth", "layout");
  revalidatePath("/me");
}

/** Build a workout from parallel `exercise`/`sets` fields. Mentors may share it with every member. */
export async function createCustomWorkout(_prev: SimpleState & { id?: string }, formData: FormData): Promise<SimpleState & { id?: string }> {
  const { supabase, userId, profile } = await requireSession();
  const title = String(formData.get("title") ?? "").trim();
  const focus = String(formData.get("focus") ?? "").trim() || null;
  const minutesRaw = Number(formData.get("minutes"));
  const minutes = Number.isFinite(minutesRaw) && minutesRaw >= 1 && minutesRaw <= 300 ? Math.round(minutesRaw) : null;
  const names = formData.getAll("exercise").map((v) => String(v).trim());
  const sets = formData.getAll("sets").map((v) => String(v).trim());
  const exercises = names.map((name, i) => ({ name, sets: sets[i] ?? "" })).filter((e) => e.name).slice(0, 30);
  const shared = formData.get("shared") === "on" && isMentor(profile);
  if (title.length < 2) return { error: "Name the workout." };
  if (!exercises.length) return { error: "Add at least one exercise." };
  const { data, error } = await supabase.from("custom_workouts").insert({ user_id: userId, title, focus, minutes, exercises, shared }).select("id").single();
  if (error || !data) return { error: "Couldn't save the workout." };
  revalidatePath("/growth/body", "layout");
  return { ok: true, id: data.id };
}

export async function deleteCustomWorkout(id: string): Promise<void> {
  const { supabase } = await requireSession();
  // RLS limits this to the owner, or a mentor removing a shared workout.
  await supabase.from("custom_workouts").delete().eq("id", id);
  revalidatePath("/growth/body", "layout");
}

export async function deleteWorkoutLog(id: string): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("workout_logs").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/growth", "layout");
}

const KINDS = ["income", "fixed", "variable"] as const;

export async function addFinanceEntry(_prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const { supabase, userId } = await requireSession();
  const kind = String(formData.get("kind") ?? "") as (typeof KINDS)[number];
  const label = String(formData.get("label") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const month = String(formData.get("month") ?? "");
  if (!KINDS.includes(kind)) return { error: "Pick a type." };
  if (!label) return { error: "Give it a label." };
  if (!(amount >= 0)) return { error: "Enter an amount." };
  if (!/^\d{4}-\d{2}$/.test(month)) return { error: "Bad month." };
  const rawCategory = String(formData.get("category") ?? "");
  const category = kind !== "income" && (SPENDING_CATEGORIES as readonly string[]).includes(rawCategory) ? rawCategory : null;
  const { error } = await supabase.from("finance_entries").insert({ user_id: userId, kind, label, amount, category, month: `${month}-01` });
  if (error) return { error: "Couldn't save the entry." };
  revalidatePath("/growth", "layout");
  return { ok: true };
}

export async function deleteFinanceEntry(id: string): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("finance_entries").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/growth", "layout");
}

export async function addAsset(_prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const { supabase, userId } = await requireSession();
  const label = String(formData.get("label") ?? "").trim();
  const category = String(formData.get("category") ?? "other").trim() || "other";
  const value = Number(formData.get("value"));
  if (!label) return { error: "Give it a label." };
  if (!(value >= 0)) return { error: "Enter a value." };
  const { error } = await supabase.from("assets").insert({ user_id: userId, label, category, value });
  if (error) return { error: "Couldn't save the asset." };
  revalidatePath("/growth", "layout");
  return { ok: true };
}

export async function deleteAsset(id: string): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("assets").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/growth", "layout");
}

export async function addSavingsGoal(_prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const { supabase, userId } = await requireSession();
  const title = String(formData.get("title") ?? "").trim();
  const target = Number(formData.get("target"));
  const due = String(formData.get("due_date") ?? "");
  if (title.length < 2) return { error: "What are you saving for?" };
  if (!(target > 0)) return { error: "Set a target amount." };
  const { error } = await supabase.from("savings_goals").insert({
    user_id: userId, title, target_amount: target, due_date: /^\d{4}-\d{2}-\d{2}$/.test(due) ? due : null,
  });
  if (error) return { error: "Couldn't save the goal." };
  revalidatePath("/growth", "layout");
  return { ok: true };
}

/** Add (or, with a negative amount, withdraw) money toward a savings goal. Marks it done at the target. */
export async function addToSavingsGoal(id: string, amount: number): Promise<{ error?: string }> {
  if (!Number.isFinite(amount) || amount === 0) return { error: "Enter an amount." };
  const { supabase, userId } = await requireSession();
  const { data: goal } = await supabase.from("savings_goals").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
  if (!goal) return { error: "Goal not found." };
  const saved = Math.max(0, Number(goal.saved_amount) + amount);
  const reached = saved >= Number(goal.target_amount);
  await supabase.from("savings_goals").update({
    saved_amount: saved, done_at: reached ? (goal.done_at ?? new Date().toISOString()) : null,
  }).eq("id", id).eq("user_id", userId);
  revalidatePath("/growth", "layout");
  return {};
}

export async function deleteSavingsGoal(id: string): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("savings_goals").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/growth", "layout");
}

export async function saveFinanceReflection(_prev: SimpleState, formData: FormData): Promise<SimpleState> {
  const { supabase, userId } = await requireSession();
  const month = String(formData.get("month") ?? "");
  if (!/^\d{4}-\d{2}$/.test(month)) return { error: "Bad month." };
  const answers = Object.fromEntries(MONEY_PROMPTS.map((p) => [p.key, String(formData.get(p.key) ?? "").trim() || null])) as Record<(typeof MONEY_PROMPTS)[number]["key"], string | null>;
  if (!Object.values(answers).some(Boolean)) return { error: "Answer at least one question." };
  const { error } = await supabase.from("finance_reflections").upsert({ user_id: userId, month: `${month}-01`, ...answers }, { onConflict: "user_id,month" });
  if (error) return { error: "Couldn't save the reflection." };
  revalidatePath("/growth", "layout");
  return { ok: true };
}
