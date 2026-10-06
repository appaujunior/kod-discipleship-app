import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PostRow, CommentRow, ReactionKind, PostKind } from "@/lib/supabase/types";

type Client = SupabaseClient<Database>;

export interface Author { id: string; display_name: string; avatar_url: string | null; role: "member" | "mentor" | "admin" }

export type FeedPost = PostRow & {
  author: Author;
  reactions: Record<ReactionKind, number>;
  mine: ReactionKind[];
  commentCount: number;
};

export type FeedComment = CommentRow & { author: Author };

type PostWithAuthor = PostRow & { author: Author | null };

async function decorate(supabase: Client, userId: string, posts: PostWithAuthor[]): Promise<FeedPost[]> {
  if (!posts.length) return [];
  const ids = posts.map((p) => p.id);
  const [{ data: reactions }, { data: comments }] = await Promise.all([
    supabase.from("reactions").select("post_id, user_id, kind").in("post_id", ids),
    supabase.from("comments").select("post_id").in("post_id", ids).is("hidden_at", null),
  ]);
  return posts
    .filter((p): p is PostRow & { author: Author } => !!p.author)
    .map((p) => {
      const counts: Record<ReactionKind, number> = { praying: 0, with_you: 0, amen: 0 };
      const mine: ReactionKind[] = [];
      for (const r of reactions ?? []) {
        if (r.post_id !== p.id) continue;
        counts[r.kind] += 1;
        if (r.user_id === userId) mine.push(r.kind);
      }
      return { ...p, reactions: counts, mine, commentCount: (comments ?? []).filter((c) => c.post_id === p.id).length };
    });
}

const AUTHOR = "author:profiles!posts_author_id_fkey(id, display_name, avatar_url, role)";

export async function feed(supabase: Client, userId: string, kind?: PostKind, limit = 40): Promise<FeedPost[]> {
  let q = supabase.from("posts").select(`*, ${AUTHOR}`).order("created_at", { ascending: false }).limit(limit);
  if (kind) q = q.eq("kind", kind);
  const { data } = await q.overrideTypes<PostWithAuthor[], { merge: false }>();
  return decorate(supabase, userId, data ?? []);
}

export async function postById(supabase: Client, userId: string, postId: string): Promise<FeedPost | null> {
  const { data } = await supabase.from("posts").select(`*, ${AUTHOR}`).eq("id", postId).maybeSingle().overrideTypes<PostWithAuthor, { merge: false }>();
  if (!data) return null;
  const [post] = await decorate(supabase, userId, [data]);
  return post ?? null;
}

export async function commentsFor(supabase: Client, postId: string): Promise<FeedComment[]> {
  const { data } = await supabase
    .from("comments")
    .select("*, author:profiles!comments_author_id_fkey(id, display_name, avatar_url, role)")
    .eq("post_id", postId)
    .order("created_at")
    .overrideTypes<FeedComment[], { merge: false }>();
  return (data ?? []).filter((c) => c.author);
}

export const POST_KINDS: { key: PostKind; label: string; prompt: string }[] = [
  { key: "checkin", label: "Check-in", prompt: "How are you really doing today?" },
  { key: "prayer", label: "Prayer request", prompt: "What can the brothers pray about with you?" },
  { key: "win", label: "Win", prompt: "What did you get done? Small counts." },
  { key: "question", label: "Question", prompt: "What do you need wisdom on?" },
];

export const REACTION_LABELS: Record<ReactionKind, string> = { praying: "Praying", with_you: "With you", amen: "Amen" };
