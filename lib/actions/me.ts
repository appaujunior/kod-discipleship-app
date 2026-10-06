"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/auth";

export interface MeState { error?: string; ok?: boolean }

export async function updateProfile(_prev: MeState, formData: FormData): Promise<MeState> {
  const { supabase, userId } = await requireSession();
  const display_name = String(formData.get("display_name") ?? "").trim();
  const cohort = String(formData.get("cohort") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim().slice(0, 280) || null;
  const timezone = String(formData.get("timezone") ?? "").trim() || "America/Chicago";
  const avatar_url = String(formData.get("avatar_url") ?? "").trim() || null;
  if (display_name.length < 2) return { error: "Name needs at least 2 characters." };
  if (avatar_url && !/^https:\/\//.test(avatar_url)) return { error: "Avatar must be an https link." };
  try { new Intl.DateTimeFormat("en-US", { timeZone: timezone }); } catch { return { error: "Unknown time zone." }; }
  const { error } = await supabase.from("profiles").update({ display_name, cohort, bio, timezone, avatar_url }).eq("id", userId);
  if (error) return { error: "Couldn't save your profile." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function addMilestone(_prev: MeState, formData: FormData): Promise<MeState> {
  const { supabase, userId } = await requireSession();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "life").trim() || "life";
  const target_date = String(formData.get("target_date") ?? "") || null;
  if (title.length < 2) return { error: "Name the milestone." };
  const { error } = await supabase.from("milestones").insert({ user_id: userId, title, category, target_date });
  if (error) return { error: "Couldn't save the milestone." };
  revalidatePath("/me", "layout");
  return { ok: true };
}

export async function setMilestoneAchieved(id: string, achieved: boolean, date: string): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("milestones").update({ achieved_at: achieved ? date : null }).eq("id", id).eq("user_id", userId);
  revalidatePath("/me", "layout");
}

export async function deleteMilestone(id: string): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("milestones").delete().eq("id", id).eq("user_id", userId);
  revalidatePath("/me", "layout");
}
