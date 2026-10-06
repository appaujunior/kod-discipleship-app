"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";

export interface EntryState { error?: string; ok?: boolean }

const MOODS = ["steady", "grateful", "tired", "struggling", "fired up"];

export async function createEntry(_prev: EntryState, formData: FormData): Promise<EntryState> {
  const { supabase, userId } = await requireSession();
  const field = (name: string) => String(formData.get(name) ?? "").trim() || null;
  const body = field("body");
  const grateful = field("grateful");
  const proud = field("proud");
  const kingdom = field("kingdom");
  const date = String(formData.get("entry_date") ?? "");
  const mood = String(formData.get("mood") ?? "");
  if (![body, grateful, proud, kingdom].some((v) => v && v.length >= 2)) return { error: "Answer at least one question." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Bad date." };
  const { error } = await supabase.from("journal_entries").insert({
    user_id: userId, body, grateful, proud, kingdom, entry_date: date, mood: MOODS.includes(mood) ? mood : null,
  });
  if (error) return { error: "Couldn't save the entry." };
  revalidatePath("/growth", "layout");
  revalidatePath("/me");
  revalidatePath("/today");
  return { ok: true };
}

export async function deleteEntry(id: string): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("journal_entries").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/growth", "layout");
}

export async function createPrayer(_prev: EntryState, formData: FormData): Promise<EntryState> {
  const { supabase, userId } = await requireSession();
  const title = String(formData.get("title") ?? "").trim();
  const detail = String(formData.get("detail") ?? "").trim() || null;
  if (title.length < 2) return { error: "What are you praying for?" };
  const { error } = await supabase.from("prayers").insert({ user_id: userId, title, detail });
  if (error) return { error: "Couldn't save the prayer." };
  revalidatePath("/growth", "layout");
  return { ok: true };
}

export async function setPrayerAnswered(id: string, answered: boolean): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("prayers").update({ answered_at: answered ? new Date().toISOString() : null }).eq("id", id).eq("user_id", userId);
  revalidatePath("/growth", "layout");
}

export async function deletePrayer(id: string): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("prayers").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/growth", "layout");
}

export async function saveWeeklyPlan(_prev: EntryState, formData: FormData): Promise<EntryState> {
  const { supabase, userId } = await requireSession();
  const week = String(formData.get("week_start") ?? "");
  const focus = String(formData.get("focus") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week)) return { error: "Bad week." };
  const { error } = await supabase.from("weekly_plans").upsert({ user_id: userId, week_start: week, focus, notes }, { onConflict: "user_id,week_start" });
  if (error) return { error: "Couldn't save the plan." };
  revalidatePath("/growth", "layout");
  return { ok: true };
}
