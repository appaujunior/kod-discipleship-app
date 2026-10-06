import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { WORKOUTS, workoutBySlug } from "@/lib/data/workouts";
import type { CustomWorkoutRow } from "@/lib/supabase/types";
import { parseDateOnly } from "@/lib/utils";
import { PageHeader, Pill, SectionTitle } from "@/components/ui/bits";
import { LinkButton } from "@/components/ui/button";
import { DeleteLogButton } from "./log-button";

export const metadata: Metadata = { title: "Body" };

function CustomList({ items }: { items: CustomWorkoutRow[] }) {
  return (
    <ul className="rounded-card border border-line bg-surface divide-y divide-line">
      {items.map((w) => (
        <li key={w.id}><Link href={`/growth/body/${w.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2">
          <span className="min-w-0"><span className="block font-semibold text-ink">{w.title}</span><span className="block text-sm text-ink-3 truncate">{[w.focus, w.minutes ? `${w.minutes} min` : null, `${w.exercises.length} exercise${w.exercises.length === 1 ? "" : "s"}`].filter(Boolean).join(" · ")}</span></span>
          <span className="text-ink-3">›</span>
        </Link></li>
      ))}
    </ul>
  );
}

export default async function BodyPage() {
  const { supabase, userId } = await requireSession();
  const [{ data: logs }, { data: custom }] = await Promise.all([
    supabase.from("workout_logs").select("*").eq("user_id", userId).order("done_on", { ascending: false }).limit(14),
    supabase.from("custom_workouts").select("*").order("created_at", { ascending: false }),
  ]);
  const mine = (custom ?? []).filter((w) => w.user_id === userId && !w.shared);
  const fromMentors = (custom ?? []).filter((w) => w.shared);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader back="/growth" eyebrow="Strength is stewardship" title="Body" action={<LinkButton href="/growth/body/new" size="sm"><Plus className="size-4" aria-hidden /> Build</LinkButton>} />
      {fromMentors.length > 0 && <section><SectionTitle>From your mentors</SectionTitle><CustomList items={fromMentors} /></section>}
      <section>
        <SectionTitle>Your workouts</SectionTitle>
        {mine.length ? <CustomList items={mine} /> : <p className="text-sm text-ink-3 px-1">Build your own: your exercises, your sets. Tap “Build” above.</p>}
      </section>
      <section>
        <SectionTitle>Library</SectionTitle>
        <ul className="rounded-card border border-line bg-surface divide-y divide-line">
          {WORKOUTS.map((w) => (
            <li key={w.slug}><Link href={`/growth/body/${w.slug}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2">
              <span className="min-w-0"><span className="block font-semibold text-ink">{w.title}</span><span className="block text-sm text-ink-3 truncate">{w.focus} · {w.minutes} min</span></span>
              <Pill tone={w.level === "Beginner" ? "green" : w.level === "Intermediate" ? "navy" : "gold"}>{w.level}</Pill>
            </Link></li>
          ))}
        </ul>
      </section>
      <section>
        <SectionTitle>Training log</SectionTitle>
        {!logs?.length ? <p className="text-sm text-ink-3 px-1">No sessions logged yet. Open a workout and tap “Log this workout” when you finish.</p> : (
          <ul className="rounded-card border border-line bg-surface divide-y divide-line">
            {logs.map((l) => (
              <li key={l.id} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-[15px] text-ink">{l.title ?? workoutBySlug(l.workout_slug)?.title ?? "Workout"}</span>
                <span className="flex items-center gap-3 text-xs text-ink-3">{parseDateOnly(l.done_on).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}<DeleteLogButton id={l.id} /></span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
