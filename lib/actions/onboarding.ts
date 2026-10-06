"use server";

import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { planBySlug } from "@/lib/bible/plans";

export interface OnboardingState {
  error?: string;
}

export async function completeOnboarding(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const { supabase, userId } = await requireSession({ allowUnonboarded: true });
  const name = String(formData.get("name") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "America/Chicago");
  const cohort = String(formData.get("cohort") ?? "").trim() || null;
  const planSlug = String(formData.get("plan") ?? "");
  if (name.length < 2) return { error: "Tell us what to call you." };
  if (!planBySlug(planSlug)) return { error: "Pick a reading plan to start with." };

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: name, timezone, cohort, onboarded: true })
    .eq("id", userId);
  if (error) return { error: "Couldn't save your profile. Try again." };

  await supabase.from("user_plans").upsert({ user_id: userId, plan_slug: planSlug }, { onConflict: "user_id,plan_slug" });
  redirect("/today");
}
