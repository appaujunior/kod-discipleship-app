import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, GoalRow, MentorNoteRow, VideoRow } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export interface GoalWithProgress extends GoalRow {
  stepsDone: number;
  stepsTotal: number;
}

/** Active goals with step counts, soonest due first. */
export async function activeGoals(supabase: Client, userId: string, limit = 3): Promise<GoalWithProgress[]> {
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (!goals?.length) return [];
  const { data: steps } = await supabase
    .from("goal_steps")
    .select("goal_id, done_at")
    .in("goal_id", goals.map((g) => g.id));
  return goals.map((g) => {
    const mine = (steps ?? []).filter((s) => s.goal_id === g.id);
    return { ...g, stepsDone: mine.filter((s) => s.done_at).length, stepsTotal: mine.length };
  });
}

export type MentorNoteWithAuthor = MentorNoteRow & { author: { display_name: string; avatar_url: string | null } | null };

/** The most recent note that is still pinned (or posted in the last 7 days). */
export async function currentMentorNote(supabase: Client, today: string): Promise<MentorNoteWithAuthor | null> {
  const weekAgo = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data } = await supabase
    .from("mentor_notes")
    .select("*, author:profiles!mentor_notes_author_id_fkey(display_name, avatar_url)")
    .or(`pinned_until.gte.${today},created_at.gte.${weekAgo}`)
    .order("created_at", { ascending: false })
    .limit(1)
    .overrideTypes<MentorNoteWithAuthor[], { merge: false }>();
  return data?.[0] ?? null;
}

export async function featuredVideo(supabase: Client): Promise<VideoRow | null> {
  const { data } = await supabase.from("videos").select("*").order("featured", { ascending: false }).order("created_at", { ascending: false }).limit(1);
  return data?.[0] ?? null;
}
