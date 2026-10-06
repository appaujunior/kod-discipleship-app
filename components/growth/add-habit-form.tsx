"use client";

import { useActionState, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { createHabit, type HabitFormState } from "@/lib/actions/habits";
import { PILLARS } from "@/lib/data/pillars";
import { Button, SubmitButton } from "@/components/ui/button";
import { Input, Label, Select, FormError } from "@/components/ui/form";
import { Card, CardBody } from "@/components/ui/card";

export function AddHabitForm() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState<HabitFormState, FormData>(async (prev, formData) => {
    const result = await createHabit(prev, formData);
    if (result.ok) {
      ref.current?.reset();
      setOpen(false);
    }
    return result;
  }, {});
  if (!open) return <Button variant="outline" onClick={() => setOpen(true)}><Plus className="size-4" aria-hidden /> Add a habit</Button>;
  return (
    <Card>
      <CardBody>
        <form ref={ref} action={action} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="h-title">Habit</Label>
            <Input id="h-title" name="title" placeholder="e.g. Call Mom" required autoFocus />
          </div>
          <div>
            <Label htmlFor="h-detail">Detail (optional)</Label>
            <Input id="h-detail" name="detail" placeholder="What counts as done?" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="h-pillar">Pillar</Label>
              <Select id="h-pillar" name="pillar" defaultValue="growth">{PILLARS.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}</Select>
            </div>
            <div>
              <Label htmlFor="h-target">Days a week</Label>
              <Select id="h-target" name="target" defaultValue="7">{[7, 6, 5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}</Select>
            </div>
          </div>
          <FormError message={state.error} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <SubmitButton>Save habit</SubmitButton>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
