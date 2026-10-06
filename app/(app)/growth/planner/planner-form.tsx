"use client";

import { useActionState } from "react";
import { saveWeeklyPlan, type EntryState } from "@/lib/actions/journal";
import { SubmitButton } from "@/components/ui/button";
import { Input, Label, Textarea, FormError, FormNotice } from "@/components/ui/form";
import { Card, CardBody } from "@/components/ui/card";

export function PlannerForm({ week, focus, notes }: { week: string; focus: string; notes: string }) {
  const [state, action] = useActionState<EntryState, FormData>(saveWeeklyPlan, {});
  return (
    <Card>
      <CardBody>
        <form action={action} className="flex flex-col gap-3" key={week}>
          <input type="hidden" name="week_start" value={week} />
          <div><Label htmlFor="focus">One focus for the week</Label><Input id="focus" name="focus" defaultValue={focus} placeholder="e.g. Be on time, every time" /></div>
          <div><Label htmlFor="notes">Plan</Label><Textarea id="notes" name="notes" defaultValue={notes} rows={6} placeholder={"Mon: gym 6am, study 7-8pm\nTue: call Marcus\nWed: …"} /></div>
          <FormError message={state.error} />
          <FormNotice message={state.ok ? "Saved." : null} />
          <SubmitButton className="self-end">Save week</SubmitButton>
        </form>
      </CardBody>
    </Card>
  );
}
