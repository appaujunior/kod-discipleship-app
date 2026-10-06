import type { Metadata } from "next";
import { Target, NotebookPen, HandHelping, CalendarRange, Dumbbell, Wallet, BarChart3, Smartphone } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { todayIn } from "@/lib/utils";
import { habitsWithLogs, weekEnding, streakInfo } from "@/lib/queries/habits";
import { PageHeader, RowLink, SectionTitle } from "@/components/ui/bits";
import { Card } from "@/components/ui/card";
import { HabitWeek } from "@/components/growth/habit-week";
import { AddHabitForm } from "@/components/growth/add-habit-form";

export const metadata: Metadata = { title: "Growth" };

export default async function GrowthPage() {
  const { supabase, userId, profile } = await requireSession();
  const today = todayIn(profile.timezone);
  const days = weekEnding(today);
  const habits = await habitsWithLogs(supabase, userId, days[0]!, today);
  const streak = await streakInfo(supabase, userId, today, habits.filter((h) => h.target_per_week === 7).map((h) => h.id));
  const { count: activeGoals } = await supabase.from("goals").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Rising chart" title="Growth" />

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Day streak", value: streak.current },
          { label: "Perfect days", value: streak.perfectDays },
          { label: "Completions", value: streak.completions },
        ].map((s) => (
          <Card key={s.label} className="px-3 py-3 text-center">
            <p className="display text-2xl font-semibold text-ink tnum">{s.value}</p>
            <p className="text-[11px] uppercase tracking-wider text-ink-3 font-semibold mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <SectionTitle>This week</SectionTitle>
        <HabitWeek today={today} days={days} habits={habits.map((h) => ({ id: h.id, title: h.title, pillar: h.pillar, target: h.target_per_week, done: [...h.doneOn] }))} />
        <AddHabitForm />
      </section>

      <section>
        <SectionTitle>Modules</SectionTitle>
        <Card className="divide-y divide-line overflow-hidden">
          <RowLink href="/growth/goals" title="Goals" meta={`${activeGoals ?? 0} in motion`} icon={<Target className="size-[18px]" />} />
          <RowLink href="/growth/planner" title="Weekly planner" meta="One focus for the week" icon={<CalendarRange className="size-[18px]" />} />
          <RowLink href="/growth/journal" title="Journal" meta="Evening reflection" icon={<NotebookPen className="size-[18px]" />} />
          <RowLink href="/growth/prayer" title="Prayer list" meta="What you're carrying to God" icon={<HandHelping className="size-[18px]" />} />
          <RowLink href="/growth/screen-time" title="Screen time & focus" meta="Daily goal, focus sessions, lock-down guide" icon={<Smartphone className="size-[18px]" />} />
          <RowLink href="/growth/body" title="Body" meta="Workouts, build your own, training log" icon={<Dumbbell className="size-[18px]" />} />
          <RowLink href="/growth/finance" title="Finance" meta="Budget, savings goals, reflection" icon={<Wallet className="size-[18px]" />} />
          <RowLink href="/growth/report" title="Monthly report" meta="Alignment by pillar" icon={<BarChart3 className="size-[18px]" />} />
        </Card>
      </section>
    </div>
  );
}
