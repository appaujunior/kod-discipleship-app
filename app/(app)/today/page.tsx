import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Flame, Play, Target } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { todayIn, greetingFor, parseDateOnly } from "@/lib/utils";
import { verseOfTheDay } from "@/lib/bible/daily-verses";
import { verseText } from "@/lib/bible/kjv.server";
import { habitsWithLogs, streakInfo } from "@/lib/queries/habits";
import { nextReadings } from "@/lib/queries/word";
import { activeGoals, currentMentorNote, featuredVideo } from "@/lib/queries/today";
import { Card, CardBody } from "@/components/ui/card";
import { Avatar, Pill, ProgressBar, SectionTitle } from "@/components/ui/bits";
import { LinkButton } from "@/components/ui/button";
import { VerseCard } from "@/components/word/verse-card";
import { ReadingCard } from "@/components/word/reading-card";
import { HabitChecklist } from "@/components/today/habit-checklist";
import { PILLAR_BY_KEY } from "@/lib/data/pillars";

export const metadata: Metadata = { title: "Today" };

export default async function TodayPage() {
  const { supabase, userId, profile } = await requireSession();
  const today = todayIn(profile.timezone);
  const reference = verseOfTheDay(today);

  const [habits, readings, goals, note, video, text, { data: savedRows }] = await Promise.all([
    habitsWithLogs(supabase, userId, today, today),
    nextReadings(supabase, userId),
    activeGoals(supabase, userId, 3),
    currentMentorNote(supabase, today),
    featuredVideo(supabase),
    verseText(reference),
    supabase.from("saved_items").select("ref").eq("user_id", userId).eq("kind", "verse").eq("ref", reference),
  ]);
  const streak = await streakInfo(supabase, userId, today, habits.filter((h) => h.target_per_week === 7).map((h) => h.id));

  const dateLabel = parseDateOnly(today).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const checklist = habits.map((h) => ({ id: h.id, title: h.title, detail: h.detail, pillar: h.pillar, done: h.doneOn.has(today) }));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-ink-3">{dateLabel}</p>
          <p className="eyebrow mt-1.5">{greetingFor(profile.timezone)}</p>
          <h1 className="display text-[26px] font-semibold text-ink leading-tight truncate">
            {profile.display_name.split(" ")[0]}.
          </h1>
        </div>
        <Pill tone={streak.current > 0 ? "gold" : "neutral"} className="mt-1 h-7 px-2.5 text-[13px]">
          <Flame className="size-3.5" aria-hidden /> <span className="tnum">{streak.current}</span> day{streak.current === 1 ? "" : "s"}
        </Pill>
      </header>

      {note && (
        <Card className="border-gold/50 bg-gold-soft">
          <CardBody className="flex gap-3">
            <Avatar name={note.author?.display_name ?? "Mentor"} src={note.author?.avatar_url} size={36} />
            <div className="min-w-0">
              <p className="eyebrow">Word from {note.author?.display_name ?? "a mentor"}</p>
              <p className="text-[15px] text-ink mt-1 whitespace-pre-line">{note.body}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {text && <VerseCard reference={reference} text={text} saved={(savedRows?.length ?? 0) > 0} />}

      <section>
        <SectionTitle action={<Link href="/word" className="text-sm font-semibold text-green">All plans</Link>}>Today&apos;s reading</SectionTitle>
        {readings.length === 0 ? (
          <Card><CardBody className="flex items-center justify-between gap-3">
            <p className="text-sm text-ink-2">No reading plan yet.</p>
            <LinkButton href="/word" size="sm">Start one</LinkButton>
          </CardBody></Card>
        ) : (
          <div className="flex flex-col gap-3">{readings.map((r) => <ReadingCard key={r.plan.slug} reading={r} />)}</div>
        )}
      </section>

      <section>
        <SectionTitle action={<Link href="/growth" className="text-sm font-semibold text-green">Week view</Link>}>Habits</SectionTitle>
        <HabitChecklist habits={checklist} date={today} />
      </section>

      {goals.length > 0 && (
        <section>
          <SectionTitle action={<Link href="/growth/goals" className="text-sm font-semibold text-green">All goals</Link>}>Goals in motion</SectionTitle>
          <ul className="rounded-card border border-line bg-surface divide-y divide-line">
            {goals.map((g) => (
              <li key={g.id}>
                <Link href={`/growth/goals/${g.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
                  <span className={`inline-flex size-9 items-center justify-center rounded-lg ${PILLAR_BY_KEY[g.pillar].chip}`}><Target className="size-4" aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold text-ink truncate">{g.title}</span>
                    <span className="block text-xs text-ink-3 tnum">{g.stepsDone}/{g.stepsTotal} steps{g.due_date ? ` · due ${parseDateOnly(g.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : ""}</span>
                    <ProgressBar value={g.stepsDone} max={Math.max(1, g.stepsTotal)} className="mt-1.5" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {video && (
        <section>
          <SectionTitle action={<Link href="/word/videos" className="text-sm font-semibold text-green">Library</Link>}>Featured teaching</SectionTitle>
          <Link href={`/word/videos/${video.id}`} className="group block rounded-card border border-line bg-surface overflow-hidden">
            <div className="relative aspect-video bg-navy">
              <Image src={`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`} alt="" fill sizes="(max-width: 512px) 100vw, 512px" className="object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
              <span className="absolute inset-0 grid place-items-center"><span className="inline-flex size-12 items-center justify-center rounded-full bg-white/90 text-navy"><Play className="size-5 ml-0.5" aria-hidden /></span></span>
            </div>
            <div className="px-4 py-3">
              <p className="font-semibold text-ink leading-tight">{video.title}</p>
              {video.channel && <p className="text-sm text-ink-3 mt-0.5">{video.channel}</p>}
            </div>
          </Link>
        </section>
      )}
    </div>
  );
}
