"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { MessageCircle, Flag, EyeOff, Eye, Trash2 } from "lucide-react";
import { toggleReaction, reportPost, setPostHidden, deletePost } from "@/lib/actions/brothers";
import { REACTION_LABELS, type FeedPost } from "@/lib/queries/brothers";
import type { ReactionKind } from "@/lib/supabase/types";
import { Avatar, Pill } from "@/components/ui/bits";
import { cn, timeAgo } from "@/lib/utils";

const KIND_TONE: Record<FeedPost["kind"], { label: string; tone: "neutral" | "green" | "navy" | "gold" }> = {
  checkin: { label: "Check-in", tone: "neutral" },
  prayer: { label: "Prayer", tone: "navy" },
  win: { label: "Win", tone: "gold" },
  question: { label: "Question", tone: "green" },
};

export function PostCard({ post, viewerId, viewerIsMentor, detail = false }: { post: FeedPost; viewerId: string; viewerIsMentor: boolean; detail?: boolean }) {
  const [state, apply] = useOptimistic(post, (p, kind: ReactionKind) => {
    const has = p.mine.includes(kind);
    return { ...p, mine: has ? p.mine.filter((k) => k !== kind) : [...p.mine, kind], reactions: { ...p.reactions, [kind]: p.reactions[kind] + (has ? -1 : 1) } };
  });
  const [pending, start] = useTransition();
  const isAuthor = post.author_id === viewerId;
  const kind = KIND_TONE[post.kind];

  return (
    <article className={cn("rounded-card border bg-surface", post.hidden_at ? "border-danger/40 opacity-75" : "border-line")}>
      <div className="flex items-start gap-3 px-4 pt-4">
        <Avatar name={post.author.display_name} src={post.author.avatar_url} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-ink">{post.author.display_name}</span>
            {post.author.role !== "member" && <Pill tone="gold" className="capitalize">{post.author.role}</Pill>}
            <span className="text-xs text-ink-3">{timeAgo(post.created_at)}</span>
          </div>
          <Pill tone={kind.tone} className="mt-1">{kind.label}</Pill>
        </div>
        {post.hidden_at && <Pill tone="danger">Hidden</Pill>}
      </div>
      <div className="px-4 pt-3 pb-3">
        {detail ? (
          <p className="text-[16px] leading-relaxed text-ink whitespace-pre-line">{post.body}</p>
        ) : (
          <Link href={`/brothers/${post.id}`} className="block text-[16px] leading-relaxed text-ink whitespace-pre-line line-clamp-6">{post.body}</Link>
        )}
      </div>
      <div className="flex items-center gap-1 px-2 pb-2 border-t border-line pt-2">
        {(Object.keys(REACTION_LABELS) as ReactionKind[]).map((k) => {
          const on = state.mine.includes(k);
          return (
            <button key={k} type="button" aria-pressed={on} disabled={pending} onClick={() => start(async () => { apply(k); await toggleReaction(post.id, k); })}
              className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors", on ? "bg-green-soft text-green" : "text-ink-3 hover:bg-surface-2 hover:text-ink")}>
              {REACTION_LABELS[k]}{state.reactions[k] > 0 && <span className="tnum">{state.reactions[k]}</span>}
            </button>
          );
        })}
        <span className="flex-1" />
        <Link href={`/brothers/${post.id}`} className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-ink-3 hover:bg-surface-2 hover:text-ink"><MessageCircle className="size-3.5" aria-hidden /><span className="tnum">{post.commentCount}</span></Link>
        {!isAuthor && !viewerIsMentor && (
          <button type="button" aria-label="Report post" disabled={pending} onClick={() => { const r = prompt("Why are you reporting this post?"); if (r !== null) start(() => reportPost(post.id, r)); }} className="inline-flex size-8 items-center justify-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-danger"><Flag className="size-3.5" /></button>
        )}
        {viewerIsMentor && (
          <button type="button" aria-label={post.hidden_at ? "Restore post" : "Hide post"} disabled={pending} onClick={() => start(() => setPostHidden(post.id, !post.hidden_at))} className="inline-flex size-8 items-center justify-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink">{post.hidden_at ? <Eye className="size-4" /> : <EyeOff className="size-4" />}</button>
        )}
        {(isAuthor || viewerIsMentor) && (
          <button type="button" aria-label="Delete post" disabled={pending} onClick={() => { if (confirm("Delete this post?")) start(() => deletePost(post.id)); }} className="inline-flex size-8 items-center justify-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-danger"><Trash2 className="size-4" /></button>
        )}
      </div>
    </article>
  );
}
