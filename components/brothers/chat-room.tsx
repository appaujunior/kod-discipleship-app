"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ArrowUp, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { sendChatMessage, setChatMessageHidden, deleteChatMessage } from "@/lib/actions/chat";
import type { ChatMessage } from "@/lib/queries/chat";
import type { Author } from "@/lib/queries/brothers";
import type { ChatMessageRow } from "@/lib/supabase/types";
import { Avatar, Pill } from "@/components/ui/bits";
import { cn, timeAgo } from "@/lib/utils";

interface Viewer { id: string; isMentor: boolean }

/**
 * The all-members chat room. Messages arrive over Supabase Realtime (RLS applies, so
 * hidden messages never reach members); sends go through a server action.
 */
export function ChatRoom({ initial, viewer }: { initial: ChatMessage[]; viewer: Viewer }) {
  const supabase = useMemo(() => createClient(), []);
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string>();
  const [sending, startSend] = useTransition();
  const authors = useRef(new Map<string, Author>(initial.map((m) => [m.author.id, m.author])));
  const bottom = useRef<HTMLDivElement>(null);

  const upsert = (m: ChatMessage) => setMessages((list) => {
    const i = list.findIndex((x) => x.id === m.id);
    if (i === -1) return [...list, m].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const next = list.slice();
    next[i] = m;
    return next;
  });
  const remove = (id: string) => setMessages((list) => list.filter((m) => m.id !== id));

  useEffect(() => {
    const authorFor = async (id: string): Promise<Author | null> => {
      const known = authors.current.get(id);
      if (known) return known;
      const { data } = await supabase.from("profiles").select("id, display_name, avatar_url, role").eq("id", id).maybeSingle();
      if (data) authors.current.set(id, data);
      return data;
    };
    const channel = supabase
      .channel("kod-chat")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, async (payload) => {
        if (payload.eventType === "DELETE") return remove((payload.old as { id: string }).id);
        const row = payload.new as ChatMessageRow;
        if (row.hidden_at && !viewer.isMentor && row.author_id !== viewer.id) return remove(row.id);
        const author = await authorFor(row.author_id);
        if (author) upsert({ ...row, author });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, viewer.id, viewer.isMentor]);

  // Keep the newest message in view when one arrives.
  useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [messages.length]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    startSend(async () => {
      const res = await sendChatMessage(body);
      setError(res.error);
      if (res.message) { upsert(res.message); setDraft(""); }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-ink-3 text-center">Everyone in KOD sees this room. Mentors moderate it like the feed.</p>
      {messages.length === 0 && <p className="text-sm text-ink-3 text-center py-10">No messages yet. Say what&apos;s up, brother.</p>}
      <ol className="flex flex-col gap-3" aria-live="polite">
        {messages.map((m) => {
          const mine = m.author_id === viewer.id;
          return (
            <li key={m.id} className={cn("flex gap-2 max-w-[85%]", mine && "self-end flex-row-reverse")}>
              {!mine && <Avatar name={m.author.display_name} src={m.author.avatar_url} size={30} className="mt-5" />}
              <div className={cn("flex flex-col gap-0.5 min-w-0", mine && "items-end")}>
                <span className="flex items-center gap-1.5 text-[11px] text-ink-3 px-1">
                  {!mine && <span className="font-semibold text-ink-2">{m.author.display_name}</span>}
                  {m.author.role !== "member" && <Pill tone="gold" className="px-1.5 py-0 text-[10px] capitalize">{m.author.role}</Pill>}
                  <time dateTime={m.created_at}>{timeAgo(m.created_at)}</time>
                </span>
                <p className={cn("rounded-2xl px-3.5 py-2 text-[15px] leading-snug whitespace-pre-line break-words", mine ? "bg-green text-on-green rounded-br-md" : "bg-surface border border-line text-ink rounded-bl-md", m.hidden_at && "opacity-50")}>{m.body}</p>
                <MessageControls message={m} viewer={viewer} onDeleted={() => remove(m.id)} />
              </div>
            </li>
          );
        })}
      </ol>
      <div ref={bottom} />
      <form onSubmit={send} className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] flex items-end gap-2 rounded-card border border-line bg-surface p-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.currentTarget.form?.requestSubmit(); } }}
          rows={1}
          maxLength={1000}
          placeholder="Message the brothers"
          aria-label="Message"
          className="flex-1 resize-none bg-transparent px-2 py-2 text-[16px] text-ink placeholder:text-ink-3 focus:outline-none max-h-32"
        />
        <button type="submit" disabled={sending || !draft.trim()} aria-label="Send" className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-green text-on-green disabled:opacity-40">
          <ArrowUp className="size-5" />
        </button>
      </form>
      {error && <p role="alert" className="text-sm text-danger text-center">{error}</p>}
    </div>
  );
}

function MessageControls({ message, viewer, onDeleted }: { message: ChatMessage; viewer: Viewer; onDeleted: () => void }) {
  const [pending, start] = useTransition();
  const mine = message.author_id === viewer.id;
  if (!mine && !viewer.isMentor) return null;
  return (
    <span className="flex gap-3 px-1 text-[11px] font-semibold text-ink-3">
      {message.hidden_at && <span className="inline-flex items-center gap-1 text-danger"><EyeOff className="size-3" aria-hidden />Hidden</span>}
      {viewer.isMentor && !mine && (
        <button type="button" disabled={pending} onClick={() => start(() => setChatMessageHidden(message.id, !message.hidden_at))} className="hover:text-ink">{message.hidden_at ? "Unhide" : "Hide"}</button>
      )}
      <button type="button" disabled={pending} onClick={() => { if (confirm("Delete this message?")) start(async () => { await deleteChatMessage(message.id); onDeleted(); }); }} className="hover:text-danger">Delete</button>
    </span>
  );
}
