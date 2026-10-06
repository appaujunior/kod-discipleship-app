"use client";

import { useActionState } from "react";
import { logScreenTime, setScreenTimeGoal, type ScreenTimeState } from "@/lib/actions/screen-time";
import { SubmitButton } from "@/components/ui/button";
import { Input, Label, FormError, FormNotice, Help } from "@/components/ui/form";

export function LogScreenTimeForm({ defaultDate, max }: { defaultDate: string; max: string }) {
  const [state, action] = useActionState<ScreenTimeState, FormData>(logScreenTime, {});
  return (
    <form action={action} className="flex flex-col gap-2">
      <div className="grid grid-cols-[1fr_5rem_5rem] gap-2 items-end">
        <div><Label htmlFor="st-date" className="text-xs">Day</Label><Input id="st-date" name="log_date" type="date" defaultValue={defaultDate} max={max} className="h-11 text-sm" /></div>
        <div><Label htmlFor="st-h" className="text-xs">Hours</Label><Input id="st-h" name="hours" type="number" inputMode="numeric" min={0} max={24} placeholder="0" className="h-11" /></div>
        <div><Label htmlFor="st-m" className="text-xs">Min</Label><Input id="st-m" name="minutes" type="number" inputMode="numeric" min={0} max={59} placeholder="0" className="h-11" /></div>
      </div>
      <Help className="mt-0">iPhone: Settings → Screen Time → See All App & Website Activity. Android: Settings → Digital Wellbeing.</Help>
      <SubmitButton>Log screen time</SubmitButton>
      <FormError message={state.error} />
      {state.ok && <FormNotice message="Logged. Honest numbers beat good-looking ones." />}
    </form>
  );
}

export function GoalForm({ goalMinutes }: { goalMinutes: number }) {
  const [state, action] = useActionState<ScreenTimeState, FormData>(setScreenTimeGoal, {});
  return (
    <form action={action} className="flex items-end gap-2">
      <div className="flex-1"><Label htmlFor="st-goal" className="text-xs">Daily goal (hours)</Label><Input id="st-goal" name="goal_hours" type="number" inputMode="decimal" min={0.25} max={24} step={0.25} defaultValue={goalMinutes / 60} className="h-11" /></div>
      <SubmitButton variant="secondary">Set goal</SubmitButton>
      <FormError message={state.error} />
    </form>
  );
}
