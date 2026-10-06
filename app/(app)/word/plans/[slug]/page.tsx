import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { planBySlug, planSchedule, dayLabel } from "@/lib/bible/plans";
import { formatPassage, readerHref } from "@/lib/bible/refs";
import { PageHeader, ProgressBar } from "@/components/ui/bits";
import { Card, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { ReadingDoneButton } from "@/components/word/reading-done-button";
import { PlanJoinButton } from "../../plan-join-button";
import { cn } from "@/lib/utils";

const PAGE = 30;

export async function generateMetadata(props: PageProps<"/word/plans/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: planBySlug(slug)?.title ?? "Plan" };
}

export default async function PlanPage(props: PageProps<"/word/plans/[slug]">) {
  const { slug } = await props.params;
  const sp = await props.searchParams;
  const plan = planBySlug(slug);
  if (!plan) notFound();

  const { supabase, userId } = await requireSession();
  const [{ data: joined }, { data: progress }] = await Promise.all([
    supabase.from("user_plans").select("id").eq("user_id", userId).eq("plan_slug", slug).maybeSingle(),
    supabase.from("plan_progress").select("day_number").eq("user_id", userId).eq("plan_slug", slug),
  ]);
  const done = new Set((progress ?? []).map((p) => p.day_number));
  let next = 1;
  while (next <= plan.days && done.has(next)) next += 1;

  const pages = Math.ceil(plan.days / PAGE);
  const requested = Number(sp.page);
  const page = Number.isInteger(requested) && requested >= 1 && requested <= pages ? requested : Math.min(pages, Math.ceil(Math.min(next, plan.days) / PAGE));
  const schedule = planSchedule(plan);
  const from = (page - 1) * PAGE;
  const days = schedule.slice(from, from + PAGE);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/word" eyebrow={plan.tagline} title={plan.title} action={<PlanJoinButton slug={slug} joined={!!joined} />} />
      <Card>
        <CardBody className="flex flex-col gap-2">
          <p className="text-sm text-ink-2">{plan.description}</p>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-ink-3">Progress</span>
            <span className="tnum font-semibold text-ink">{done.size} / {plan.days}</span>
          </div>
          <ProgressBar value={done.size} max={plan.days} />
        </CardBody>
      </Card>

      <div className="flex items-center justify-between">
        <span className="text-sm text-ink-3 tnum">Readings {from + 1}–{Math.min(from + PAGE, plan.days)}</span>
        <div className="flex gap-2">
          <LinkButton href={`/word/plans/${slug}?page=${page - 1}`} size="sm" variant="secondary" className={cn(page <= 1 && "pointer-events-none opacity-40")} aria-disabled={page <= 1}>Prev</LinkButton>
          <LinkButton href={`/word/plans/${slug}?page=${page + 1}`} size="sm" variant="secondary" className={cn(page >= pages && "pointer-events-none opacity-40")} aria-disabled={page >= pages}>Next</LinkButton>
        </div>
      </div>

      <ol className="rounded-card border border-line bg-surface divide-y divide-line">
        {days.map((passages, i) => {
          const dayNumber = from + i + 1;
          const isDone = done.has(dayNumber);
          const isNext = dayNumber === next;
          return (
            <li key={dayNumber} className={cn("px-4 py-3 flex items-center gap-3", isNext && "bg-green-soft/60")}>
              <div className="min-w-0 flex-1">
                <p className={cn("text-xs font-semibold tnum", isNext ? "text-green" : "text-ink-3")}>{dayLabel(plan, dayNumber)}{isNext && " · up next"}</p>
                <p className="text-[15px] text-ink leading-snug">
                  {passages.map((p, j) => (
                    <span key={formatPassage(p)}>
                      {j > 0 && <span className="text-ink-3">, </span>}
                      <Link href={readerHref(p)} className="hover:underline">{formatPassage(p)}</Link>
                    </span>
                  ))}
                </p>
              </div>
              <ReadingDoneButton slug={slug} dayNumber={dayNumber} done={isDone} size="sm" />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
