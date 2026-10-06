import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { todayIn, parseDateOnly } from "@/lib/utils";
import { PageHeader, SectionTitle, EmptyState, Pill } from "@/components/ui/bits";
import { MilestoneForm, MilestoneRowActions } from "./milestone-forms";

export const metadata: Metadata = { title: "Milestones" };

export default async function MilestonesPage() {
  const { supabase, userId, profile } = await requireSession();
  const today = todayIn(profile.timezone);
  const { data } = await supabase.from("milestones").select("*").eq("user_id", userId).order("target_date", { ascending: true, nullsFirst: false });
  const ahead = (data ?? []).filter((m) => !m.achieved_at);
  const done = (data ?? []).filter((m) => m.achieved_at).sort((a, b) => (b.achieved_at! > a.achieved_at! ? 1 : -1));
  const fmt = (d: string) => parseDateOnly(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader back="/me" eyebrow="Legacy" title="Milestones" />
      <MilestoneForm />
      <section>
        <SectionTitle>Ahead</SectionTitle>
        {ahead.length === 0 ? <EmptyState title="Nothing plotted yet" body="Graduation, first apartment, a business, a family. Put a date on it." /> : (
          <ol className="relative border-l-2 border-line ml-3 flex flex-col gap-4 py-1">
            {ahead.map((m) => (
              <li key={m.id} className="relative pl-5"><span className="absolute -left-[7px] top-1.5 size-3 rounded-full border-2 border-gold bg-surface" />
                <div className="flex items-start justify-between gap-2"><div><p className="font-semibold text-ink leading-tight">{m.title}</p><p className="text-xs text-ink-3 mt-0.5">{m.target_date ? fmt(m.target_date) : "No date"} · <span className="capitalize">{m.category}</span></p></div><MilestoneRowActions id={m.id} achieved={false} today={today} /></div>
              </li>
            ))}
          </ol>
        )}
      </section>
      {done.length > 0 && (
        <section>
          <SectionTitle>Achieved</SectionTitle>
          <ol className="relative border-l-2 border-gold ml-3 flex flex-col gap-4 py-1">
            {done.map((m) => (
              <li key={m.id} className="relative pl-5"><span className="absolute -left-[7px] top-1.5 size-3 rounded-full bg-gold" />
                <div className="flex items-start justify-between gap-2"><div><p className="font-semibold text-ink leading-tight">{m.title}</p><p className="text-xs text-ink-3 mt-0.5"><Pill tone="gold">{fmt(m.achieved_at!)}</Pill></p></div><MilestoneRowActions id={m.id} achieved today={today} /></div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
