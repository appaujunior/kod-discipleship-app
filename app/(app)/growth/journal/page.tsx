import type { Metadata } from "next";
import { Flame } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { todayIn, parseDateOnly } from "@/lib/utils";
import { JOURNAL_PROMPTS, journalStreak } from "@/lib/data/journal";
import { PageHeader, Pill, EmptyState } from "@/components/ui/bits";
import { JournalForm, DeleteEntryButton } from "./journal-form";

export const metadata: Metadata = { title: "Journal" };

export default async function JournalPage() {
  const { supabase, userId, profile } = await requireSession();
  const today = todayIn(profile.timezone);
  const { data: entries } = await supabase.from("journal_entries").select("*").eq("user_id", userId).order("entry_date", { ascending: false }).order("created_at", { ascending: false }).limit(60);
  const streak = journalStreak((entries ?? []).map((e) => e.entry_date), today);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        back="/growth"
        eyebrow="Evening reflection"
        title="Journal"
        action={<Pill tone={streak > 0 ? "gold" : "neutral"} className="h-7 px-2.5 text-[13px]"><Flame className="size-3.5" aria-hidden /><span className="tnum">{streak}</span> night{streak === 1 ? "" : "s"}</Pill>}
      />
      <JournalForm today={today} />
      {!entries?.length ? (
        <EmptyState title="Nothing written yet" body="Three honest answers a night. Grateful, proud, and how you moved the Kingdom forward." />
      ) : (
        <ul className="flex flex-col gap-3">
          {entries.map((e) => (
            <li key={e.id} className="rounded-card border border-line bg-surface px-4 py-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-semibold text-ink-3 uppercase tracking-wider">{parseDateOnly(e.entry_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                <span className="flex items-center gap-2">{e.mood && <Pill>{e.mood}</Pill>}<DeleteEntryButton id={e.id} /></span>
              </div>
              <dl className="flex flex-col gap-2">
                {JOURNAL_PROMPTS.filter((p) => e[p.key]).map((p) => (
                  <div key={p.key}>
                    <dt className="text-xs font-semibold text-gold-deep">{p.question}</dt>
                    <dd className="text-[15px] leading-relaxed text-ink whitespace-pre-line">{e[p.key]}</dd>
                  </div>
                ))}
              </dl>
              {e.body && <p className="text-[15px] leading-relaxed text-ink whitespace-pre-line mt-2">{e.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
