import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, KeyRound } from "lucide-react";
import { requireSession, isMentor } from "@/lib/auth";
import { PageHeader, SectionTitle, EmptyState, Avatar, RowLink } from "@/components/ui/bits";
import { Card } from "@/components/ui/card";
import { timeAgo } from "@/lib/utils";
import { NoteForm, DeleteNoteButton, ReportActions } from "./mentor-forms";

export const metadata: Metadata = { title: "Mentor tools" };

export default async function MentorPage() {
  const { supabase, profile } = await requireSession();
  if (!isMentor(profile)) redirect("/me");

  const [{ data: reports }, { data: notes }, { data: hidden }] = await Promise.all([
    supabase.from("reports").select("id, reason, created_at, post_id, reporter:profiles!reports_reporter_id_fkey(display_name), post:posts!reports_post_id_fkey(body, author:profiles!posts_author_id_fkey(display_name))").is("resolved_at", null).order("created_at")
      .overrideTypes<{ id: string; reason: string; created_at: string; post_id: string | null; reporter: { display_name: string } | null; post: { body: string; author: { display_name: string } | null } | null }[], { merge: false }>(),
    supabase.from("mentor_notes").select("*, author:profiles!mentor_notes_author_id_fkey(display_name)").order("created_at", { ascending: false }).limit(10)
      .overrideTypes<{ id: string; body: string; pinned_until: string | null; created_at: string; author: { display_name: string } | null }[], { merge: false }>(),
    supabase.from("posts").select("id, body, created_at, author:profiles!posts_author_id_fkey(display_name)").not("hidden_at", "is", null).order("hidden_at", { ascending: false }).limit(10)
      .overrideTypes<{ id: string; body: string; created_at: string; author: { display_name: string } | null }[], { merge: false }>(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader back="/me" eyebrow="Keeper of the room" title="Mentor tools" />
      <Card className="divide-y divide-line overflow-hidden">
        <RowLink href="/me/mentor/members" title="Members and roles" meta={profile.role === "admin" ? "Promote mentors, view everyone" : "View everyone"} icon={<Users className="size-[18px]" />} />
        <RowLink href="/me/mentor/invites" title="Invite codes" meta="Who can create an account" icon={<KeyRound className="size-[18px]" />} />
      </Card>

      <section>
        <SectionTitle>Reports to review</SectionTitle>
        {!reports?.length ? <EmptyState title="Nothing reported" body="When a brother flags a post it shows up here." /> : (
          <ul className="flex flex-col gap-3">
            {reports.map((r) => (
              <li key={r.id} className="rounded-card border border-danger/40 bg-surface px-4 py-3 flex flex-col gap-2">
                <p className="text-xs text-ink-3">{r.reporter?.display_name ?? "Someone"} reported {timeAgo(r.created_at)}: <span className="text-ink">“{r.reason}”</span></p>
                {r.post ? <blockquote className="text-sm text-ink-2 border-l-2 border-line pl-3 line-clamp-4">{r.post.author?.display_name ?? "Member"}: {r.post.body}</blockquote> : <p className="text-sm text-ink-3">Post no longer exists.</p>}
                <div className="flex items-center justify-between">{r.post_id && <Link href={`/brothers/${r.post_id}`} className="text-sm font-semibold text-green">Open post</Link>}<ReportActions id={r.id} /></div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <SectionTitle>Word from a mentor</SectionTitle>
        <NoteForm />
        {(notes?.length ?? 0) > 0 && (
          <ul className="rounded-card border border-line bg-surface divide-y divide-line mt-3">
            {notes!.map((n) => (
              <li key={n.id} className="flex gap-3 px-4 py-3"><Avatar name={n.author?.display_name ?? "Mentor"} size={32} /><div className="min-w-0 flex-1"><p className="text-xs text-ink-3">{n.author?.display_name} · {timeAgo(n.created_at)}{n.pinned_until ? ` · pinned until ${n.pinned_until}` : ""}</p><p className="text-sm text-ink whitespace-pre-line mt-0.5">{n.body}</p></div><DeleteNoteButton id={n.id} /></li>
            ))}
          </ul>
        )}
      </section>

      {(hidden?.length ?? 0) > 0 && (
        <section>
          <SectionTitle>Hidden posts</SectionTitle>
          <ul className="rounded-card border border-line bg-surface divide-y divide-line">
            {hidden!.map((p) => <li key={p.id}><Link href={`/brothers/${p.id}`} className="block px-4 py-2.5 hover:bg-surface-2"><p className="text-xs text-ink-3">{p.author?.display_name} · {timeAgo(p.created_at)}</p><p className="text-sm text-ink-2 line-clamp-2">{p.body}</p></Link></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
