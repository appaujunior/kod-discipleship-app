"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { addStep, toggleStep, deleteStep, setGoalStatus } from "@/lib/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface Step { id: string; title: string; done: boolean }

export function GoalSteps({ goalId, steps, status }: { goalId: string; steps: Step[]; status: "active" | "done" | "archived" }) {
  const [items, apply] = useOptimistic(steps, (state, id: string) => state.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  const [pending, start] = useTransition();
  const [title, setTitle] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <ul className="rounded-card border border-line bg-surface divide-y divide-line">
        {items.map((s) => (
          <li key={s.id} className="flex items-center gap-3 px-3 py-2.5">
            <button type="button" aria-pressed={s.done} onClick={() => start(async () => { apply(s.id); await toggleStep(s.id, goalId, !s.done); })} className="flex items-center gap-3 flex-1 min-w-0 text-left">
              <span className={cn("inline-flex size-6 items-center justify-center rounded-full border-2 shrink-0", s.done ? "border-green bg-green text-on-green" : "border-line-strong text-transparent")} aria-hidden><Check className="size-3.5" strokeWidth={3} /></span>
              <span className={cn("text-[15px] truncate", s.done ? "text-ink-3 line-through" : "text-ink")}>{s.title}</span>
            </button>
            <button type="button" aria-label="Delete step" onClick={() => start(() => deleteStep(s.id, goalId))} className="text-ink-3 hover:text-danger p-1"><Trash2 className="size-4" /></button>
          </li>
        ))}
        {items.length === 0 && <li className="px-4 py-3 text-sm text-ink-3">No steps yet. What&apos;s the very next move?</li>}
      </ul>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const t = title; setTitle(""); start(() => addStep(goalId, t)); }}>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Add a step" aria-label="New step" className="h-11" />
        <Button type="submit" size="icon" className="h-11 w-11 shrink-0" disabled={!title.trim() || pending} aria-label="Add step"><Plus className="size-5" /></Button>
      </form>
      <div className="flex gap-2 justify-end">
        {status === "active" ? (
          <>
            <Button variant="ghost" size="sm" disabled={pending} onClick={() => start(() => setGoalStatus(goalId, "archived"))}>Archive</Button>
            <Button variant="gold" size="sm" disabled={pending} onClick={() => start(() => setGoalStatus(goalId, "done"))}><Check className="size-4" aria-hidden /> Goal reached</Button>
          </>
        ) : (
          <Button variant="secondary" size="sm" disabled={pending} onClick={() => start(() => setGoalStatus(goalId, "active"))}>Reopen</Button>
        )}
      </div>
    </div>
  );
}
