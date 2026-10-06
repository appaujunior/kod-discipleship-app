"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { addComment, deleteComment } from "@/lib/actions/brothers";
import { Avatar, Pill } from "@/components/ui/bits";
import { Button } from "@/components/ui/button";
import { Textarea, FormError } from "@/components/ui/form";
import { timeAgo } from "@/lib/utils";

interface C { id: string; body: string; created_at: string; author_id: string; author: { display_name: string; avatar_url: string | null; role: string } }

export function Comments({ postId, comments, viewerId, viewerIsMentor, viewerName, viewerAvatar }: { postId: string; comments: C[]; viewerId: string; viewerIsMentor: boolean; viewerName: string; viewerAvatar: string | null }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, start] = useTransition();
  return (
    <section className="flex flex-col gap-3">
      <h2 className="eyebrow">{comments.length} {comments.length === 1 ? "reply" : "replies"}</h2>
      <ul className="flex flex-col gap-2">
        {comments.map((c) => (
          <li key={c.id} className="flex gap-3 rounded-card border border-line bg-surface px-3 py-3">
            <Avatar name={c.author.display_name} src={c.author.avatar_url} size={32} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap text-sm"><span className="font-semibold text-ink">{c.author.display_name}</span>{c.author.role !== "member" && <Pill tone="gold" className="capitalize">{c.author.role}</Pill>}<span className="text-xs text-ink-3">{timeAgo(c.created_at)}</span></div>
              <p className="text-[15px] text-ink whitespace-pre-line mt-0.5">{c.body}</p>
            </div>
            {(c.author_id === viewerId || viewerIsMentor) && <button type="button" aria-label="Delete reply" disabled={pending} onClick={() => start(() => deleteComment(c.id, postId))} className="text-ink-3 hover:text-danger self-start"><Trash2 className="size-4" /></button>}
          </li>
        ))}
      </ul>
      <form onSubmit={(e) => { e.preventDefault(); const text = body; start(async () => { const r = await addComment(postId, text); if (r.error) setError(r.error); else { setBody(""); setError(undefined); } }); }} className="flex gap-3 rounded-card border border-line bg-surface p-3">
        <Avatar name={viewerName} src={viewerAvatar} size={32} />
        <div className="flex-1 flex flex-col gap-2">
          <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Reply with something true." rows={2} maxLength={1000} className="min-h-12 border-0 bg-transparent px-0 py-1 focus:ring-0 resize-none" aria-label="Reply" />
          <FormError message={error} />
          <Button type="submit" size="sm" className="self-end" disabled={pending || !body.trim()}>Reply</Button>
        </div>
      </form>
    </section>
  );
}
