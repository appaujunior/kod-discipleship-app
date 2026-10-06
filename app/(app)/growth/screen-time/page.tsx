import type { Metadata } from "next";
import { Timer, ShieldCheck, Users } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { todayIn, parseDateOnly, toDateOnly } from "@/lib/utils";
import { LOCKDOWN_GUIDES, formatMinutes } from "@/lib/data/screen-time";
import { PageHeader, SectionTitle } from "@/components/ui/bits";
import { Card, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ScreenTimeChart } from "@/components/growth/screen-time-chart";
import { LogScreenTimeForm, GoalForm } from "./screen-time-forms";

export const metadata: Metadata = { title: "Screen time" };

const DAYS = 14;

export default async function ScreenTimePage() {
  const { supabase, userId, profile } = await requireSession();
  const today = todayIn(profile.timezone);
  const dates = Array.from({ length: DAYS }, (_, i) => {
    const d = parseDateOnly(today);
    d.setDate(d.getDate() - (DAYS - 1 - i));
    return toDateOnly(d);
  });
  const yesterday = dates[DAYS - 2]!;
  const [{ data: logs }, { data: focus }] = await Promise.all([
    supabase.from("screen_time_logs").select("log_date, minutes").eq("user_id", userId).gte("log_date", dates[0]!).order("log_date"),
    supabase.from("focus_sessions").select("minutes").eq("user_id", userId).gte("completed_on", dates[DAYS - 7]!),
  ]);
  const byDate = new Map((logs ?? []).map((l) => [l.log_date, l.minutes]));
  const days = dates.map((date) => ({ date, minutes: byDate.get(date) ?? null }));
  const goal = profile.screen_time_goal_minutes;
  const lastWeek = days.slice(-7).filter((d) => d.minutes != null) as { date: string; minutes: number }[];
  const average = lastWeek.length ? lastWeek.reduce((n, d) => n + d.minutes, 0) / lastWeek.length : null;
  const underGoal = lastWeek.filter((d) => d.minutes <= goal).length;
  const focusMinutes = (focus ?? []).reduce((n, f) => n + f.minutes, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader back="/growth" eyebrow="Guard your eyes, guard your time" title="Screen time" />

      <Card className="bg-navy border-navy text-white">
        <CardBody className="grid grid-cols-3 gap-2 text-center">
          <div><p className="display text-2xl tnum">{average == null ? "—" : formatMinutes(average)}</p><p className="text-[11px] uppercase tracking-wider text-white/60 mt-0.5">7-day avg</p></div>
          <div><p className="display text-2xl tnum">{underGoal}/{lastWeek.length || 0}</p><p className="text-[11px] uppercase tracking-wider text-white/60 mt-0.5">Days on goal</p></div>
          <div><p className="display text-2xl tnum">{formatMinutes(focusMinutes)}</p><p className="text-[11px] uppercase tracking-wider text-white/60 mt-0.5">Focused</p></div>
        </CardBody>
      </Card>

      <section>
        <SectionTitle>Last {DAYS} days</SectionTitle>
        <ScreenTimeChart days={days} goal={goal} />
      </section>

      <section>
        <SectionTitle>Log a day</SectionTitle>
        <Card><CardBody className="flex flex-col gap-4">
          <LogScreenTimeForm defaultDate={byDate.has(yesterday) ? today : yesterday} max={today} />
          <GoalForm goalMinutes={goal} />
        </CardBody></Card>
        <p className="flex gap-2 text-sm text-ink-3 mt-2 px-1"><Users className="size-4 shrink-0 mt-0.5" aria-hidden />Your accountability partner can see your screen time. That&apos;s the point.</p>
      </section>

      <Card className="border-green/40 bg-green-soft">
        <CardBody className="flex items-center gap-3">
          <Timer className="size-6 text-green shrink-0" aria-hidden />
          <div className="flex-1 min-w-0"><p className="font-semibold text-ink">Focus session</p><p className="text-sm text-ink-2">Set an intention, put the phone face-up, and stay on one screen.</p></div>
          <LinkButton href="/growth/focus" size="sm">Start</LinkButton>
        </CardBody>
      </Card>

      <section>
        <SectionTitle>Lock it down with a brother</SectionTitle>
        <p className="text-sm text-ink-2 mb-3 px-1 flex gap-2"><ShieldCheck className="size-4 shrink-0 mt-0.5 text-gold-deep" aria-hidden />KOD can&apos;t block other apps from the browser. Your phone can, and a brother holding the passcode makes it stick.</p>
        <div className="flex flex-col gap-2">
          {LOCKDOWN_GUIDES.map((g) => (
            <details key={g.platform} className="group rounded-card border border-line bg-surface open:pb-2">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold text-ink">{g.platform}<span className="text-ink-3 transition-transform group-open:rotate-90">›</span></summary>
              <p className="px-4 text-sm text-ink-2 mb-3">{g.intro}</p>
              <ol className="flex flex-col gap-3 px-4 pb-2">
                {g.steps.map((s, i) => (
                  <li key={s.title} className="flex gap-3">
                    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-ink-2 tnum">{i + 1}</span>
                    <span><span className="block text-[15px] font-semibold text-ink">{s.title}</span><span className="block text-sm text-ink-2">{s.detail}</span></span>
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
