import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { activeGoals } from "@/lib/queries/today";
import { PILLAR_BY_KEY } from "@/lib/data/pillars";
import { parseDateOnly } from "@/lib/utils";
import { PageHeader, ProgressBar, Pill, SectionTitle, EmptyState } from "@/components/ui/bits";
import { NewGoalForm } from "./new-goal-form";

export const metadata: Metadata = { title: "Goals" };

export default async function GoalsPage() {
  const { supabase, userId } = await requireSession();
  const [active, { data: done }] = await Promise.all([
    activeGoals(supabase, userId, 50),
    supabase.from("goals").select("id, title, pillar, completed_at").eq("user_id", userId).eq("status", "done").order("completed_at", { ascending: false }).limit(20),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader back="/growth" eyebrow="Reach it" title="Goals" />
      <NewGoalForm />
      <section>
        <SectionTitle>In motion</SectionTitle>
        {active.length === 0 ? (
          <EmptyState title="No goals yet" body="A goal is a direction with steps. Add one above and break it into the next three moves." />
        ) : (
          <ul className="rounded-card border border-line bg-surface divide-y divide-line">
            {active.map((g) => (
              <li key={g.id}>
                <Link href={`/growth/goals/${g.id}`} className="block px-4 py-3 hover:bg-surface-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-ink truncate">{g.title}</span>
                    <Pill className={PILLAR_BY_KEY[g.pillar].chip}>{PILLAR_BY_KEY[g.pillar].name}</Pill>
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-3 mt-1 tnum">
                    <span>{g.stepsDone}/{g.stepsTotal} steps</span>
                    {g.due_date && <span>Due {parseDateOnly(g.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                  </div>
                  <ProgressBar value={g.stepsDone} max={Math.max(1, g.stepsTotal)} className="mt-1.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      {(done?.length ?? 0) > 0 && (
        <section>
          <SectionTitle>Reached</SectionTitle>
          <ul className="rounded-card border border-line bg-surface divide-y divide-line">
            {done!.map((g) => (
              <li key={g.id}><Link href={`/growth/goals/${g.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-surface-2"><span className="text-ink-2 line-through decoration-line-strong truncate">{g.title}</span><span className="text-xs text-ink-3">{g.completed_at ? new Date(g.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}</span></Link></li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
