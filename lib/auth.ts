import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/lib/supabase/types";

export interface Session {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  email: string | null;
  profile: ProfileRow;
}

/**
 * Current member, or a redirect to /sign-in. Cached per request so layouts and pages
 * share one lookup. Members who haven't finished onboarding are sent there.
 */
export const requireSession = cache(async (opts: { allowUnonboarded?: boolean } = {}): Promise<Session> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/sign-in");
  if (!profile.onboarded && !opts.allowUnonboarded) redirect("/onboarding");

  return { supabase, userId: user.id, email: user.email ?? null, profile };
});

export function isMentor(profile: ProfileRow): boolean {
  return profile.role === "mentor" || profile.role === "admin";
}
