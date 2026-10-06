"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { Check, Trash2, Undo2 } from "lucide-react";
import { addMilestone, setMilestoneAchieved, deleteMilestone, type MeState } from "@/lib/actions/me";
import { SubmitButton } from "@/components/ui/button";
import { Input, Select, FormError } from "@/components/ui/form";

export function MilestoneForm() {
  const [state, action] = useActionState<MeState, FormData>(addMilestone, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state.ok]);
  return (
    <form ref={ref} action={action} className="flex flex-col gap-2">
      <Input name="title" placeholder="e.g. Graduate, buy a car, launch the business" required aria-label="Milestone" />
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
        <Select name="category" defaultValue="life" aria-label="Category"><option value="life">Life</option><option value="education">Education</option><option value="career">Career</option><option value="faith">Faith</option><option value="family">Family</option><option value="finance">Finance</option></Select>
        <Input name="target_date" type="date" aria-label="Target date" />
        <SubmitButton>Add</SubmitButton>
      </div>
      <FormError message={state.error} />
    </form>
  );
}

export function MilestoneRowActions({ id, achieved, today }: { id: string; achieved: boolean; today: string }) {
  const [pending, start] = useTransition();
  return (
    <span className="flex items-center gap-1 shrink-0">
      <button type="button" aria-label={achieved ? "Mark not achieved" : "Mark achieved"} disabled={pending} onClick={() => start(() => setMilestoneAchieved(id, !achieved, today))} className="inline-flex size-8 items-center justify-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-gold-deep">{achieved ? <Undo2 className="size-4" /> : <Check className="size-4" />}</button>
      <button type="button" aria-label="Delete" disabled={pending} onClick={() => { if (confirm("Delete this milestone?")) start(() => deleteMilestone(id)); }} className="inline-flex size-8 items-center justify-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-danger"><Trash2 className="size-4" /></button>
    </span>
  );
}
