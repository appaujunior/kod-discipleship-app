"use client";

import { useActionState, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { createGoal, type GoalFormState } from "@/lib/actions/goals";
import { PILLARS } from "@/lib/data/pillars";
import { Button, SubmitButton } from "@/components/ui/button";
import { Input, Label, Select, Textarea, FormError, Help } from "@/components/ui/form";
import { Card, CardBody } from "@/components/ui/card";

export function NewGoalForm() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState<GoalFormState, FormData>(async (prev, formData) => {
    const result = await createGoal(prev, formData);
    if (result.ok) {
      ref.current?.reset();
      setOpen(false);
    }
    return result;
  }, {});
  if (!open) return <Button onClick={() => setOpen(true)}><Plus className="size-4" aria-hidden /> New goal</Button>;
  return (
    <Card>
      <CardBody>
        <form ref={ref} action={action} className="flex flex-col gap-3">
          <div><Label htmlFor="g-title">Goal</Label><Input id="g-title" name="title" placeholder="e.g. Finish my GED prep" required autoFocus /></div>
          <div><Label htmlFor="g-why">Why it matters (optional)</Label><Input id="g-why" name="why" placeholder="One honest sentence" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="g-pillar">Pillar</Label><Select id="g-pillar" name="pillar" defaultValue="growth">{PILLARS.map((p) => <option key={p.key} value={p.key}>{p.name}</option>)}</Select></div>
            <div><Label htmlFor="g-due">Due (optional)</Label><Input id="g-due" name="due_date" type="date" /></div>
          </div>
          <div>
            <Label htmlFor="g-steps">First steps</Label>
            <Textarea id="g-steps" name="steps" placeholder={"One per line\nRegister for the test\nStudy 30 min, 4 days a week"} rows={3} />
            <Help>You can add more steps later.</Help>
          </div>
          <FormError message={state.error} />
          <div className="flex gap-2 justify-end"><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><SubmitButton>Save goal</SubmitButton></div>
        </form>
      </CardBody>
    </Card>
  );
}
