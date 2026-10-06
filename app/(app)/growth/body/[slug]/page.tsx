import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSession, isMentor } from "@/lib/auth";
import { workoutBySlug, type Workout } from "@/lib/data/workouts";
import { todayIn } from "@/lib/utils";
import { PageHeader, Pill } from "@/components/ui/bits";
import { LogWorkoutButton, DeleteWorkoutButton } from "../log-button";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Shown = Pick<Workout, "title" | "exercises"> & { eyebrow: string; focus: string | null; customId?: string; canDelete?: boolean };

/** A library workout by slug, or a custom one (yours or mentor-shared) by id. */
async function loadWorkout(slug: string): Promise<Shown | null> {
  const lib = workoutBySlug(slug);
  if (lib) return { title: lib.title, exercises: lib.exercises, focus: lib.focus, eyebrow: `${lib.level} · ${lib.minutes} min` };
  if (!UUID.test(slug)) return null;
  const { supabase, userId, profile } = await requireSession();
  const { data } = await supabase.from("custom_workouts").select("*").eq("id", slug).maybeSingle();
  if (!data) return null;
  return {
    title: data.title, exercises: data.exercises, focus: data.focus, customId: data.id,
    eyebrow: [data.shared ? "From your mentors" : "Your workout", data.minutes ? `${data.minutes} min` : null].filter(Boolean).join(" · "),
    canDelete: data.user_id === userId || (data.shared && isMentor(profile)),
  };
}

export async function generateMetadata(props: PageProps<"/growth/body/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: (await loadWorkout(slug))?.title ?? "Workout" };
}

export default async function WorkoutPage(props: PageProps<"/growth/body/[slug]">) {
  const { slug } = await props.params;
  const w = await loadWorkout(slug);
  if (!w) notFound();
  const { profile } = await requireSession();
  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/growth/body" eyebrow={w.eyebrow} title={w.title} action={w.focus ? <Pill>{w.focus}</Pill> : undefined} />
      <ol className="rounded-card border border-line bg-surface divide-y divide-line">
        {w.exercises.map((e, i) => (
          <li key={`${i}-${e.name}`} className="flex items-center gap-3 px-4 py-3">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-surface-2 text-xs font-bold text-ink-2 tnum">{i + 1}</span>
            <span className="flex-1 text-[15px] text-ink">{e.name}</span>
            <span className="text-sm text-ink-3 tnum">{e.sets}</span>
          </li>
        ))}
      </ol>
      <LogWorkoutButton slug={slug} today={todayIn(profile.timezone)} />
      {w.customId && w.canDelete && <DeleteWorkoutButton id={w.customId} />}
    </div>
  );
}
