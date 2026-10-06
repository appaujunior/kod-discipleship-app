import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { todayIn, parseDateOnly } from "@/lib/utils";
import { habitsWithLogs, streakInfo } from "@/lib/queries/habits";
import { nextReadings } from "@/lib/queries/word";
import { PILLARS } from "@/lib/data/pillars";
import { PageHeader, ProgressBar, SectionTitle } from "@/components/ui/bits";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Monthly report" };

export default async function ReportPage() {
  const { supabase, userId, profile } = await requireSession();
  const today = todayIn(profile.timezone);
  const monthStart = `${today.slice(0, 7)}-01`;
  const dayOfMonth = Number(today.slice(8));
  const d = parseDateOnly(today);
  const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

  const [habits, readings, { count: journalDays }, { count: posts }, { count: prayersAnswered }] = await Promise.all([
    habitsWithLogs(supabase, userId, monthStart, today),
    nextReadings(supabase, userId),
    supabase.from("journal_entries").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("entry_date", monthStart),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("author_id", userId).gte("created_at", `${monthStart}T00:00:00Z`),
    supabase.from("prayers").select("id", { count: "exact", head: true }).eq("user_id", userId).not("answered_at", "is", null).gte("answered_at", `${monthStart}T00:00:00Z`),
  ]);
  const streak = await streakInfo(supabase, userId, today, habits.filter((h) => h.target_per_week === 7).map((h) => h.id));

  // Expected completions so far this month: target/7 per day elapsed.
  const pillarScores = PILLARS.map((p) => {
    const mine = habits.filter((h) => h.pillar === p.key);
    const expected = mine.reduce((n, h) => n + (h.target_per_week / 7) * dayOfMonth, 0);
    const actual = mine.reduce((n, h) => n + h.doneOn.size, 0);
    return { ...p, pct: expected > 0 ? Math.min(100, Math.round((actual / expected) * 100)) : 0, actual, expected: Math.round(expected) };
  });
  const overall = Math.round(pillarScores.reduce((n, p) => n + p.pct, 0) / pillarScores.length);
  const monthLabel = d.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader back="/growth" eyebrow={monthLabel} title="Monthly report" />
      <Card className="bg-green border-green text-on-green">
        <CardBody className="flex items-end justify-between">
          <div><p className="text-xs uppercase tracking-wider text-white/70">Aligned this month</p><p className="display text-4xl tnum">{overall}%</p></div>
          <p className="text-sm text-white/80 tnum">Day {dayOfMonth} of {daysInMonth}</p>
        </CardBody>
      </Card>
      <section>
        <SectionTitle>By pillar</SectionTitle>
        <ul className="rounded-card border border-line bg-surface divide-y divide-line">
          {pillarScores.map((p) => (
            <li key={p.key} className="px-4 py-3">
              <div className="flex items-center justify-between text-sm mb-1.5"><span className="flex items-center gap-2 font-semibold text-ink"><span className={cn("size-2 rounded-full", p.dot)} />{p.name}</span><span className="tnum text-ink-3">{p.actual}/{p.expected} · <span className="text-ink font-semibold">{p.pct}%</span></span></div>
              <ProgressBar value={p.pct} max={100} tone={p.key === "prayer" || p.key === "brotherhood" ? "navy" : "green"} />
            </li>
          ))}
        </ul>
      </section>
      <section>
        <SectionTitle>Activity</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Current streak", value: `${streak.current} d` },
            { label: "Perfect days", value: streak.perfectDays },
            { label: "Journal days", value: journalDays ?? 0 },
            { label: "Feed posts", value: posts ?? 0 },
            { label: "Prayers answered", value: prayersAnswered ?? 0 },
            ...readings.map((r) => ({ label: r.plan.title, value: `${r.completed}/${r.plan.days}` })),
          ].map((s) => (
            <Card key={s.label} className="px-4 py-3"><p className="display text-xl text-ink tnum">{s.value}</p><p className="text-xs text-ink-3 mt-0.5">{s.label}</p></Card>
          ))}
        </div>
      </section>
    </div>
  );
}
