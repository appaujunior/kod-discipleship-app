"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { createCustomWorkout, type SimpleState } from "@/lib/actions/body-finance";
import { SubmitButton } from "@/components/ui/button";
import { Input, Label, FormError, Help } from "@/components/ui/form";
import { Card, CardBody } from "@/components/ui/card";

type BuilderState = SimpleState & { id?: string };

/** Form for a custom workout: name, focus, length, and a growable list of exercises. */
export function WorkoutBuilder({ canShare }: { canShare: boolean }) {
  const router = useRouter();
  const [rows, setRows] = useState<number[]>([0, 1, 2]);
  const [state, action] = useActionState<BuilderState, FormData>(createCustomWorkout, {});
  useEffect(() => { if (state.ok && state.id) router.push(`/growth/body/${state.id}`); }, [state, router]);

  return (
    <form action={action} className="flex flex-col gap-5">
      <Card><CardBody className="flex flex-col gap-3">
        <div><Label htmlFor="w-title">Name</Label><Input id="w-title" name="title" placeholder="e.g. Morning Push-ups" required maxLength={80} /></div>
        <div className="grid grid-cols-[1fr_7rem] gap-2">
          <div><Label htmlFor="w-focus">Focus</Label><Input id="w-focus" name="focus" placeholder="Chest and core" maxLength={80} /></div>
          <div><Label htmlFor="w-min">Minutes</Label><Input id="w-min" name="minutes" type="number" inputMode="numeric" min={1} max={300} placeholder="30" /></div>
        </div>
      </CardBody></Card>

      <section className="flex flex-col gap-2">
        <h2 className="eyebrow">Exercises</h2>
        {rows.map((key, i) => (
          <div key={key} className="flex items-center gap-2">
            <span className="w-5 text-center text-xs font-bold text-ink-3 tnum">{i + 1}</span>
            <Input name="exercise" placeholder="Exercise" aria-label={`Exercise ${i + 1}`} maxLength={80} className="flex-1" />
            <Input name="sets" placeholder="3 × 10" aria-label={`Sets for exercise ${i + 1}`} maxLength={30} className="w-24" />
            <button type="button" aria-label={`Remove exercise ${i + 1}`} disabled={rows.length === 1} onClick={() => setRows(rows.filter((r) => r !== key))} className="text-ink-3 hover:text-danger disabled:opacity-30"><X className="size-4" /></button>
          </div>
        ))}
        {rows.length < 30 && (
          <button type="button" onClick={() => setRows([...rows, Math.max(...rows) + 1])} className="self-start inline-flex items-center gap-1 text-sm font-semibold text-green mt-1"><Plus className="size-4" aria-hidden /> Add exercise</button>
        )}
      </section>

      {canShare && (
        <label className="flex items-start gap-3 rounded-card border border-gold/50 bg-gold-soft px-4 py-3">
          <input type="checkbox" name="shared" className="mt-1 size-4 accent-green" />
          <span><span className="block font-semibold text-ink">Give this to every member</span><Help className="mt-0.5">Shows under “From your mentors” for all brothers.</Help></span>
        </label>
      )}
      <FormError message={state.error} />
      <SubmitButton size="lg">Save workout</SubmitButton>
    </form>
  );
}
