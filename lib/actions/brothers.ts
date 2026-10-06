"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession, isMentor } from "@/lib/auth";
import type { PostKind, ReactionKind, Role } from "@/lib/supabase/types";

const KINDS: PostKind[] = ["checkin", "prayer", "win", "question"];
const REACTIONS: ReactionKind[] = ["praying", "with_you", "amen"];

function refresh(postId?: string) {
  revalidatePath("/brothers", "layout");
  revalidatePath("/today");
  revalidatePath("/me", "layout");
  if (postId) revalidatePath(`/brothers/${postId}`);
}

export interface PostFormState { error?: string; ok?: boolean }

export async function createPost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const { supabase, userId } = await requireSession();
  const body = String(formData.get("body") ?? "").trim();
  const kind = String(formData.get("kind") ?? "checkin") as PostKind;
  if (body.length < 2) return { error: "Say something first." };
  if (body.length > 2000) return { error: "Keep it under 2000 characters." };
  if (!KINDS.includes(kind)) return { error: "Pick a post type." };
  const { error } = await supabase.from("posts").insert({ author_id: userId, body, kind });
  if (error) return { error: "Couldn't post. Try again." };
  refresh();
  return { ok: true };
}

export async function deletePost(postId: string): Promise<void> {
  const { supabase, userId, profile } = await requireSession();
  const q = supabase.from("posts").delete().eq("id", postId);
  await (isMentor(profile) ? q : q.eq("author_id", userId));
  refresh();
  redirect("/brothers");
}

export async function setPostHidden(postId: string, hidden: boolean): Promise<void> {
  const { supabase, userId, profile } = await requireSession();
  if (!isMentor(profile)) throw new Error("Mentors only");
  await supabase.from("posts").update({ hidden_at: hidden ? new Date().toISOString() : null, hidden_by: hidden ? userId : null }).eq("id", postId);
  refresh(postId);
}

export async function addComment(postId: string, body: string): Promise<{ error?: string }> {
  const clean = body.trim();
  if (clean.length < 1) return { error: "Write a comment first." };
  if (clean.length > 1000) return { error: "Keep it under 1000 characters." };
  const { supabase, userId } = await requireSession();
  const { error } = await supabase.from("comments").insert({ post_id: postId, author_id: userId, body: clean });
  if (error) return { error: "Couldn't comment." };
  refresh(postId);
  return {};
}

export async function deleteComment(commentId: string, postId: string): Promise<void> {
  const { supabase, userId, profile } = await requireSession();
  const q = supabase.from("comments").delete().eq("id", commentId);
  await (isMentor(profile) ? q : q.eq("author_id", userId));
  refresh(postId);
}

export async function toggleReaction(postId: string, kind: ReactionKind): Promise<void> {
  if (!REACTIONS.includes(kind)) throw new Error("Bad reaction");
  const { supabase, userId } = await requireSession();
  const { data: existing } = await supabase.from("reactions").select("post_id").eq("post_id", postId).eq("user_id", userId).eq("kind", kind).maybeSingle();
  if (existing) await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", userId).eq("kind", kind);
  else await supabase.from("reactions").insert({ post_id: postId, user_id: userId, kind });
  refresh(postId);
}

export async function reportPost(postId: string, reason: string): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("reports").insert({ post_id: postId, reporter_id: userId, reason: reason.trim().slice(0, 500) || "No reason given" });
  refresh(postId);
}

export async function resolveReport(reportId: string, action: "hide" | "keep"): Promise<void> {
  const { supabase, userId, profile } = await requireSession();
  if (!isMentor(profile)) throw new Error("Mentors only");
  const { data: report } = await supabase.from("reports").select("post_id").eq("id", reportId).maybeSingle();
  if (action === "hide" && report?.post_id) {
    await supabase.from("posts").update({ hidden_at: new Date().toISOString(), hidden_by: userId }).eq("id", report.post_id);
  }
  await supabase.from("reports").update({ resolved_by: userId, resolved_at: new Date().toISOString() }).eq("id", reportId);
  refresh();
}

// ---------- Partners ----------
export async function requestPartner(partnerId: string): Promise<void> {
  const { supabase, userId } = await requireSession();
  if (partnerId === userId) return;
  await supabase.from("partnerships").upsert({ requester_id: userId, partner_id: partnerId, status: "pending" }, { onConflict: "requester_id,partner_id" });
  refresh();
}

export async function respondPartner(partnershipId: string, accept: boolean): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("partnerships").update({ status: accept ? "active" : "ended" }).eq("id", partnershipId).eq("partner_id", userId);
  refresh();
}

export async function endPartnership(partnershipId: string): Promise<void> {
  const { supabase } = await requireSession();
  await supabase.from("partnerships").update({ status: "ended" }).eq("id", partnershipId);
  refresh();
}

// ---------- Challenges ----------
export interface ChallengeFormState { error?: string; ok?: boolean }

export async function createChallenge(_prev: ChallengeFormState, formData: FormData): Promise<ChallengeFormState> {
  const { supabase, userId } = await requireSession();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const starts = String(formData.get("starts_on") ?? "");
  const ends = String(formData.get("ends_on") ?? "");
  if (title.length < 3) return { error: "Name the challenge." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(starts) || !/^\d{4}-\d{2}-\d{2}$/.test(ends) || ends < starts) return { error: "Pick a start and end date." };
  const { data, error } = await supabase.from("challenges").insert({ creator_id: userId, title, description, starts_on: starts, ends_on: ends }).select("id").single();
  if (error || !data) return { error: "Couldn't create the challenge." };
  await supabase.from("challenge_members").insert({ challenge_id: data.id, user_id: userId });
  refresh();
  return { ok: true };
}

export async function joinChallenge(challengeId: string, join: boolean): Promise<void> {
  const { supabase, userId } = await requireSession();
  if (join) await supabase.from("challenge_members").upsert({ challenge_id: challengeId, user_id: userId }, { onConflict: "challenge_id,user_id" });
  else await supabase.from("challenge_members").delete().eq("challenge_id", challengeId).eq("user_id", userId);
  refresh();
}

export async function challengeCheckin(challengeId: string, date: string, done: boolean): Promise<void> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Bad date");
  const { supabase, userId } = await requireSession();
  if (done) await supabase.from("challenge_checkins").upsert({ challenge_id: challengeId, user_id: userId, checkin_date: date }, { onConflict: "challenge_id,user_id,checkin_date" });
  else await supabase.from("challenge_checkins").delete().eq("challenge_id", challengeId).eq("user_id", userId).eq("checkin_date", date);
  refresh();
}

export async function deleteChallenge(challengeId: string): Promise<void> {
  const { supabase, userId, profile } = await requireSession();
  const q = supabase.from("challenges").delete().eq("id", challengeId);
  await (isMentor(profile) ? q : q.eq("creator_id", userId));
  refresh();
}

// ---------- Mentor tools ----------
export interface NoteFormState { error?: string; ok?: boolean }

export async function postMentorNote(_prev: NoteFormState, formData: FormData): Promise<NoteFormState> {
  const { supabase, userId, profile } = await requireSession();
  if (!isMentor(profile)) return { error: "Mentors only." };
  const body = String(formData.get("body") ?? "").trim();
  const pinnedUntil = String(formData.get("pinned_until") ?? "") || null;
  if (body.length < 2) return { error: "Write the note first." };
  const { error } = await supabase.from("mentor_notes").insert({ author_id: userId, body, pinned_until: pinnedUntil });
  if (error) return { error: "Couldn't post the note." };
  refresh();
  return { ok: true };
}

export async function deleteMentorNote(id: string): Promise<void> {
  const { supabase, profile } = await requireSession();
  if (!isMentor(profile)) throw new Error("Mentors only");
  await supabase.from("mentor_notes").delete().eq("id", id);
  refresh();
}

export async function setRole(targetId: string, role: Role): Promise<void> {
  const { supabase, profile } = await requireSession();
  if (profile.role !== "admin") throw new Error("Admins only");
  if (!["member", "mentor", "admin"].includes(role)) throw new Error("Bad role");
  await supabase.from("profiles").update({ role }).eq("id", targetId);
  refresh();
}
