import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { todayIn, parseDateOnly, toDateOnly } from "@/lib/utils";
import { activeGoals } from "@/lib/queries/today";
import { PageHeader, SectionTitle } from "@/components/ui/bits";
import { LinkButton } from "@/components/ui/button";
import { PlannerForm } from "./planner-form";

export const metadata: Metadata = { title: "Weekly planner" };

/** Monday of the week containing `date`. */
function mondayOf(date: string): string {
  const d = parseDateOnly(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  return toDateOnly(d);
}
function shift(week: string, days: number): string {
  const d = parseDateOnly(week);
  d.setDate(d.getDate() + days);
  return toDateOnly(d);
}

export default async function PlannerPage(props: PageProps<"/growth/planner">) {
  const sp = await props.searchParams;
  const { supabase, userId, profile } = await requireSession();
  const today = todayIn(profile.timezone);
  const week = typeof sp.week === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.week) ? mondayOf(sp.week) : mondayOf(today);
  const [{ data: plan }, goals] = await Promise.all([
    supabase.from("weekly_plans").select("*").eq("user_id", userId).eq("week_start", week).maybeSingle(),
    activeGoals(supabase, userId, 5),
  ]);
  const start = parseDateOnly(week);
  const end = parseDateOnly(shift(week, 6));
  const label = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/growth" eyebrow="Plan the week" title={label} />
      <div className="flex justify-between">
        <LinkButton href={`/growth/planner?week=${shift(week, -7)}`} variant="secondary" size="sm">Last week</LinkButton>
        <LinkButton href={`/growth/planner?week=${shift(week, 7)}`} variant="secondary" size="sm">Next week</LinkButton>
      </div>
      <PlannerForm week={week} focus={plan?.focus ?? ""} notes={plan?.notes ?? ""} />
      {goals.length > 0 && (
        <section>
          <SectionTitle>Goals to move this week</SectionTitle>
          <ul className="rounded-card border border-line bg-surface divide-y divide-line">
            {goals.map((g) => <li key={g.id} className="px-4 py-2.5 text-[15px] text-ink flex justify-between"><span className="truncate">{g.title}</span><span className="text-xs text-ink-3 tnum">{g.stepsDone}/{g.stepsTotal}</span></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
