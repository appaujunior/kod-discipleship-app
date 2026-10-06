"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Plus, Check, Trash2 } from "lucide-react";
import { createChallenge, joinChallenge, challengeCheckin, deleteChallenge, type ChallengeFormState } from "@/lib/actions/brothers";
import { Button, SubmitButton } from "@/components/ui/button";
import { Input, Label, Textarea, FormError } from "@/components/ui/form";
import { Card, CardBody } from "@/components/ui/card";

export function NewChallengeForm({ today }: { today: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState<ChallengeFormState, FormData>(async (prev, formData) => {
    const result = await createChallenge(prev, formData);
    if (result.ok) {
      ref.current?.reset();
      setOpen(false);
    }
    return result;
  }, {});
  if (!open) return <Button variant="outline" onClick={() => setOpen(true)}><Plus className="size-4" aria-hidden /> Start a challenge</Button>;
  return (
    <Card><CardBody>
      <form ref={ref} action={action} className="flex flex-col gap-3">
        <div><Label htmlFor="c-title">Challenge</Label><Input id="c-title" name="title" placeholder="e.g. 7 days of morning prayer" required autoFocus /></div>
        <div><Label htmlFor="c-desc">What counts (optional)</Label><Textarea id="c-desc" name="description" rows={2} placeholder="Pray before you touch your phone. Check in here after." /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label htmlFor="c-start">Starts</Label><Input id="c-start" name="starts_on" type="date" defaultValue={today} required /></div>
          <div><Label htmlFor="c-end">Ends</Label><Input id="c-end" name="ends_on" type="date" required /></div>
        </div>
        <FormError message={state.error} />
        <div className="flex gap-2 justify-end"><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><SubmitButton>Launch</SubmitButton></div>
      </form>
    </CardBody></Card>
  );
}

export function ChallengeButtons({ id, joined, checkedIn, today, started, canDelete }: { id: string; joined: boolean; checkedIn: boolean; today: string; started: boolean; canDelete: boolean }) {
  const [pending, start] = useTransition();
  return (
    <span className="flex items-center gap-1.5 shrink-0">
      {joined && started && (
        <Button size="sm" variant={checkedIn ? "secondary" : "primary"} disabled={pending} onClick={() => start(() => challengeCheckin(id, today, !checkedIn))}><Check className="size-4" aria-hidden />{checkedIn ? "Done today" : "Check in"}</Button>
      )}
      <Button size="sm" variant={joined ? "ghost" : "outline"} disabled={pending} onClick={() => start(() => joinChallenge(id, !joined))}>{joined ? "Leave" : "Join"}</Button>
      {canDelete && <button type="button" aria-label="Delete challenge" disabled={pending} onClick={() => { if (confirm("Delete this challenge for everyone?")) start(() => deleteChallenge(id)); }} className="text-ink-3 hover:text-danger p-1"><Trash2 className="size-4" /></button>}
    </span>
  );
}
