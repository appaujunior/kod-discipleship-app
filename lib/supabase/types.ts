/**
 * Hand-maintained database types mirroring supabase/migrations (0001–0004).
 * Regenerate with `supabase gen types typescript` once the CLI is set up; until then keep in sync by hand.
 */

export type Pillar = "word" | "prayer" | "brotherhood" | "growth";
export type Role = "member" | "mentor" | "admin";
export type PostKind = "checkin" | "prayer" | "win" | "question";
export type ReactionKind = "praying" | "with_you" | "amen";

export type ProfileRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  role: Role;
  cohort: string | null;
  bio: string | null;
  timezone: string;
  onboarded: boolean;
  screen_time_goal_minutes: number;
  created_at: string;
}
export type HabitRow = {
  id: string; user_id: string; pillar: Pillar; title: string; detail: string | null;
  target_per_week: number; sort_order: number; archived: boolean; created_at: string;
}
export type HabitLogRow = { id: string; habit_id: string; user_id: string; log_date: string; created_at: string }
export type GoalRow = {
  id: string; user_id: string; pillar: Pillar; title: string; why: string | null; due_date: string | null;
  status: "active" | "done" | "archived"; completed_at: string | null; created_at: string;
}
export type GoalStepRow = { id: string; goal_id: string; user_id: string; title: string; done_at: string | null; sort_order: number; created_at: string }
export type WeeklyPlanRow = { id: string; user_id: string; week_start: string; focus: string | null; notes: string | null; created_at: string }
export type UserPlanRow = { id: string; user_id: string; plan_slug: string; started_on: string }
export type PlanProgressRow = { id: string; user_id: string; plan_slug: string; day_number: number; completed_at: string }
export type MemoryProgressRow = { id: string; user_id: string; verse_id: number; status: "learning" | "mastered"; review_count: number; last_reviewed_at: string | null }
export type PrayerRow = { id: string; user_id: string; title: string; detail: string | null; answered_at: string | null; created_at: string }
export type JournalEntryRow = {
  id: string; user_id: string; entry_date: string; body: string | null; mood: string | null;
  grateful: string | null; proud: string | null; kingdom: string | null; created_at: string;
}
export type PostRow = { id: string; author_id: string; kind: PostKind; body: string; hidden_at: string | null; hidden_by: string | null; created_at: string }
export type CommentRow = { id: string; post_id: string; author_id: string; body: string; hidden_at: string | null; hidden_by: string | null; created_at: string }
export type ReactionRow = { post_id: string; user_id: string; kind: ReactionKind; created_at: string }
export type ReportRow = { id: string; post_id: string | null; comment_id: string | null; reporter_id: string; reason: string; resolved_by: string | null; resolved_at: string | null; created_at: string }
export type MentorNoteRow = { id: string; author_id: string; body: string; pinned_until: string | null; created_at: string }
export type PartnershipRow = { id: string; requester_id: string; partner_id: string; status: "pending" | "active" | "ended"; created_at: string }
export type ChallengeRow = { id: string; creator_id: string; title: string; description: string | null; starts_on: string; ends_on: string; created_at: string }
export type ChallengeMemberRow = { challenge_id: string; user_id: string; joined_at: string }
export type ChallengeCheckinRow = { challenge_id: string; user_id: string; checkin_date: string }
export type VideoRow = { id: string; youtube_id: string; title: string; channel: string | null; topic: string | null; added_by: string | null; featured: boolean; created_at: string }
export type SavedItemRow = { id: string; user_id: string; kind: "verse" | "video"; ref: string; created_at: string }
export type DistinctionRow = { id: string; user_id: string; badge: string; earned_at: string }
export type MilestoneRow = { id: string; user_id: string; title: string; category: string; target_date: string | null; achieved_at: string | null; created_at: string }
export type FinanceEntryRow = { id: string; user_id: string; kind: "income" | "fixed" | "variable"; label: string; amount: number; month: string; category: string | null; created_at: string }
export type AssetRow = { id: string; user_id: string; category: string; label: string; value: number; created_at: string }
export type InviteCodeRow = { code: string; label: string | null; created_by: string | null; max_uses: number | null; uses: number; expires_at: string | null; active: boolean; created_at: string }
export type WorkoutLogRow = { id: string; user_id: string; workout_slug: string; title: string | null; done_on: string; created_at: string }
export type ScreenTimeLogRow = { id: string; user_id: string; log_date: string; minutes: number; created_at: string }
export type FocusSessionRow = { id: string; user_id: string; minutes: number; intention: string | null; stepped_away: number; completed_on: string; created_at: string }
export type Exercise = { name: string; sets: string }
export type CustomWorkoutRow = { id: string; user_id: string; title: string; focus: string | null; minutes: number | null; exercises: Exercise[]; shared: boolean; created_at: string }
export type SavingsGoalRow = { id: string; user_id: string; title: string; target_amount: number; saved_amount: number; due_date: string | null; done_at: string | null; created_at: string }
export type FinanceReflectionRow = { id: string; user_id: string; month: string; went_well: string | null; surprised: string | null; change_next: string | null; created_at: string }
export type ChatMessageRow = { id: string; author_id: string; body: string; hidden_at: string | null; hidden_by: string | null; created_at: string }

/** Table definition helper: `Req` lists the columns that must be supplied on insert. */
type Table<R, Req extends keyof R> = {
  Row: R;
  Insert: Pick<R, Req> & Partial<Omit<R, Req>>;
  Update: Partial<R>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, "id" | "display_name">;
      habits: Table<HabitRow, "user_id" | "pillar" | "title">;
      habit_logs: Table<HabitLogRow, "habit_id" | "user_id" | "log_date">;
      goals: Table<GoalRow, "user_id" | "pillar" | "title">;
      goal_steps: Table<GoalStepRow, "goal_id" | "user_id" | "title">;
      weekly_plans: Table<WeeklyPlanRow, "user_id" | "week_start">;
      user_plans: Table<UserPlanRow, "user_id" | "plan_slug">;
      plan_progress: Table<PlanProgressRow, "user_id" | "plan_slug" | "day_number">;
      memory_progress: Table<MemoryProgressRow, "user_id" | "verse_id">;
      prayers: Table<PrayerRow, "user_id" | "title">;
      journal_entries: Table<JournalEntryRow, "user_id" | "entry_date">;
      posts: Table<PostRow, "author_id" | "body">;
      comments: Table<CommentRow, "post_id" | "author_id" | "body">;
      reactions: Table<ReactionRow, "post_id" | "user_id" | "kind">;
      reports: Table<ReportRow, "reporter_id" | "reason">;
      mentor_notes: Table<MentorNoteRow, "author_id" | "body">;
      partnerships: Table<PartnershipRow, "requester_id" | "partner_id">;
      challenges: Table<ChallengeRow, "creator_id" | "title" | "starts_on" | "ends_on">;
      challenge_members: Table<ChallengeMemberRow, "challenge_id" | "user_id">;
      challenge_checkins: Table<ChallengeCheckinRow, "challenge_id" | "user_id" | "checkin_date">;
      videos: Table<VideoRow, "youtube_id" | "title">;
      saved_items: Table<SavedItemRow, "user_id" | "kind" | "ref">;
      distinctions: Table<DistinctionRow, "user_id" | "badge">;
      milestones: Table<MilestoneRow, "user_id" | "title">;
      finance_entries: Table<FinanceEntryRow, "user_id" | "kind" | "label" | "amount" | "month">;
      assets: Table<AssetRow, "user_id" | "label">;
      workout_logs: Table<WorkoutLogRow, "user_id" | "workout_slug" | "done_on">;
      invite_codes: Table<InviteCodeRow, "code">;
      screen_time_logs: Table<ScreenTimeLogRow, "user_id" | "log_date" | "minutes">;
      focus_sessions: Table<FocusSessionRow, "user_id" | "minutes" | "completed_on">;
      custom_workouts: Table<CustomWorkoutRow, "user_id" | "title">;
      savings_goals: Table<SavingsGoalRow, "user_id" | "title" | "target_amount">;
      finance_reflections: Table<FinanceReflectionRow, "user_id" | "month">;
      chat_messages: Table<ChatMessageRow, "author_id" | "body">;
    };
    Views: Record<string, never>;
    Functions: {
      is_mentor: { Args: Record<string, never>; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_partner_of: { Args: { other: string }; Returns: boolean };
      validate_invite_code: { Args: { p_code: string }; Returns: boolean };
      consume_invite_code: { Args: { p_code: string }; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
