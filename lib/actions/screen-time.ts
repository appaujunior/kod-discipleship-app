"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";

export interface ScreenTimeState { error?: string; ok?: boolean }

const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Record (or overwrite) one day's screen time, entered as hours + minutes. */
export async function logScreenTime(_prev: ScreenTimeState, formData: FormData): Promise<ScreenTimeState> {
  const { supabase, userId } = await requireSession();
  const date = String(formData.get("log_date") ?? "");
  const minutes = Math.round(Number(formData.get("hours") || 0) * 60 + Number(formData.get("minutes") || 0));
  if (!DATE.test(date)) return { error: "Pick a day." };
  if (!Number.isFinite(minutes) || minutes < 0 || minutes > 1440) return { error: "Enter a time between 0 and 24 hours." };
  const { error } = await supabase.from("screen_time_logs").upsert({ user_id: userId, log_date: date, minutes }, { onConflict: "user_id,log_date" });
  if (error) return { error: "Couldn't save screen time." };
  revalidatePath("/growth", "layout");
  revalidatePath("/today");
  return { ok: true };
}

export async function setScreenTimeGoal(_prev: ScreenTimeState, formData: FormData): Promise<ScreenTimeState> {
  const { supabase, userId } = await requireSession();
  const minutes = Math.round(Number(formData.get("goal_hours") || 0) * 60);
  if (!(minutes >= 15 && minutes <= 1440)) return { error: "Pick a goal between 15 minutes and 24 hours." };
  const { error } = await supabase.from("profiles").update({ screen_time_goal_minutes: minutes }).eq("id", userId);
  if (error) return { error: "Couldn't save the goal." };
  revalidatePath("/growth", "layout");
  return { ok: true };
}

/** Called when a focus session runs to the end. Early exits are not logged. */
export async function logFocusSession(minutes: number, intention: string, steppedAway: number, date: string): Promise<void> {
  if (!(minutes >= 1 && minutes <= 240) || !DATE.test(date)) throw new Error("Bad focus session");
  const { supabase, userId } = await requireSession();
  await supabase.from("focus_sessions").insert({
    user_id: userId, minutes: Math.round(minutes), intention: intention.trim().slice(0, 200) || null,
    stepped_away: Math.max(0, Math.min(999, Math.round(steppedAway))), completed_on: date,
  });
  revalidatePath("/growth", "layout");
}
