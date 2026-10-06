import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { PILLAR_BY_KEY } from "@/lib/data/pillars";
import { parseDateOnly } from "@/lib/utils";
import { PageHeader, Pill, ProgressBar } from "@/components/ui/bits";
import { Card, CardBody } from "@/components/ui/card";
import { GoalSteps } from "./goal-steps";

export async function generateMetadata(props: PageProps<"/growth/goals/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const { supabase } = await requireSession();
  const { data } = await supabase.from("goals").select("title").eq("id", id).maybeSingle();
  return { title: data?.title ?? "Goal" };
}

export default async function GoalPage(props: PageProps<"/growth/goals/[id]">) {
  const { id } = await props.params;
  const { supabase, userId } = await requireSession();
  const [{ data: goal }, { data: steps }] = await Promise.all([
    supabase.from("goals").select("*").eq("id", id).eq("user_id", userId).maybeSingle(),
    supabase.from("goal_steps").select("*").eq("goal_id", id).order("sort_order"),
  ]);
  if (!goal) notFound();
  const done = (steps ?? []).filter((s) => s.done_at).length;
  const pillar = PILLAR_BY_KEY[goal.pillar];

  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/growth/goals" eyebrow={pillar.name} title={goal.title} action={goal.status === "done" ? <Pill tone="gold">Reached</Pill> : goal.status === "archived" ? <Pill>Archived</Pill> : null} />
      <Card>
        <CardBody className="flex flex-col gap-2">
          {goal.why && <p className="text-[15px] text-ink-2 italic">“{goal.why}”</p>}
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-3">{goal.due_date ? `Due ${parseDateOnly(goal.due_date).toLocaleDateString("en-US", { month: "long", day: "numeric" })}` : "No due date"}</span>
            <span className="tnum font-semibold text-ink">{done}/{steps?.length ?? 0} steps</span>
          </div>
          <ProgressBar value={done} max={Math.max(1, steps?.length ?? 0)} />
        </CardBody>
      </Card>
      <GoalSteps goalId={goal.id} status={goal.status} steps={(steps ?? []).map((s) => ({ id: s.id, title: s.title, done: !!s.done_at }))} />
    </div>
  );
}
