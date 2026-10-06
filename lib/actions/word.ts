"use server";

import { revalidatePath } from "next/cache";
import { requireSession, isMentor } from "@/lib/auth";
import { planBySlug } from "@/lib/bible/plans";
import { memoryVerseById } from "@/lib/bible/memory-verses";

function refresh() {
  revalidatePath("/today");
  revalidatePath("/word", "layout");
  revalidatePath("/me");
}

export async function startPlan(slug: string): Promise<void> {
  if (!planBySlug(slug)) throw new Error("Unknown plan");
  const { supabase, userId } = await requireSession();
  await supabase.from("user_plans").upsert({ user_id: userId, plan_slug: slug }, { onConflict: "user_id,plan_slug" });
  refresh();
}

export async function leavePlan(slug: string): Promise<void> {
  const { supabase, userId } = await requireSession();
  await supabase.from("user_plans").delete().eq("user_id", userId).eq("plan_slug", slug);
  refresh();
}

export async function setReadingDone(slug: string, dayNumber: number, done: boolean): Promise<void> {
  const plan = planBySlug(slug);
  if (!plan || dayNumber < 1 || dayNumber > plan.days) throw new Error("Bad reading");
  const { supabase, userId } = await requireSession();
  if (done) {
    await supabase.from("plan_progress").upsert({ user_id: userId, plan_slug: slug, day_number: dayNumber }, { onConflict: "user_id,plan_slug,day_number" });
  } else {
    await supabase.from("plan_progress").delete().eq("user_id", userId).eq("plan_slug", slug).eq("day_number", dayNumber);
  }
  refresh();
}

/** Log a review; after three reviews the verse counts as mastered. */
export async function reviewVerse(verseId: number, master = false): Promise<void> {
  if (!memoryVerseById(verseId)) throw new Error("Unknown verse");
  const { supabase, userId } = await requireSession();
  const { data: existing } = await supabase.from("memory_progress").select("*").eq("user_id", userId).eq("verse_id", verseId).maybeSingle();
  const reviewCount = (existing?.review_count ?? 0) + 1;
  const status = master || reviewCount >= 3 ? "mastered" : "learning";
  await supabase
    .from("memory_progress")
    .upsert({ user_id: userId, verse_id: verseId, review_count: reviewCount, status, last_reviewed_at: new Date().toISOString() }, { onConflict: "user_id,verse_id" });
  refresh();
}

export async function toggleSaved(kind: "verse" | "video", ref: string): Promise<{ saved: boolean }> {
  const { supabase, userId } = await requireSession();
  const { data: existing } = await supabase.from("saved_items").select("id").eq("user_id", userId).eq("kind", kind).eq("ref", ref).maybeSingle();
  if (existing) {
    await supabase.from("saved_items").delete().eq("id", existing.id);
    refresh();
    return { saved: false };
  }
  await supabase.from("saved_items").insert({ user_id: userId, kind, ref });
  refresh();
  return { saved: true };
}

export interface VideoFormState {
  error?: string;
  ok?: boolean;
}

const YT_RE = /(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/;

/** Mentors add a video by pasting a YouTube link; title and channel come from YouTube's oEmbed endpoint. */
export async function addVideo(_prev: VideoFormState, formData: FormData): Promise<VideoFormState> {
  const { supabase, userId, profile } = await requireSession();
  if (!isMentor(profile)) return { error: "Only mentors can add videos." };
  const url = String(formData.get("url") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim() || null;
  const m = url.match(YT_RE) ?? url.match(/^([A-Za-z0-9_-]{11})$/);
  if (!m) return { error: "Paste a YouTube link." };
  const youtubeId = m[1]!;

  let title = String(formData.get("title") ?? "").trim();
  let channel: string | null = null;
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`, { cache: "no-store" });
    if (res.ok) {
      const meta = (await res.json()) as { title?: string; author_name?: string };
      title = title || meta.title || "";
      channel = meta.author_name ?? null;
    }
  } catch {
    /* fall through: title may have been typed */
  }
  if (!title) return { error: "Couldn't read that video's title. Add one yourself." };

  const { error } = await supabase.from("videos").insert({ youtube_id: youtubeId, title, channel, topic, added_by: userId });
  if (error) return { error: error.code === "23505" ? "That video is already in the library." : "Couldn't add the video." };
  refresh();
  return { ok: true };
}

export async function setFeaturedVideo(videoId: string): Promise<void> {
  const { supabase, profile } = await requireSession();
  if (!isMentor(profile)) throw new Error("Mentors only");
  await supabase.from("videos").update({ featured: false }).eq("featured", true);
  await supabase.from("videos").update({ featured: true }).eq("id", videoId);
  refresh();
}

export async function removeVideo(videoId: string): Promise<void> {
  const { supabase, profile } = await requireSession();
  if (!isMentor(profile)) throw new Error("Mentors only");
  await supabase.from("videos").delete().eq("id", videoId);
  refresh();
}
