"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { postMentorNote, deleteMentorNote, resolveReport, type NoteFormState } from "@/lib/actions/brothers";
import { Button, SubmitButton } from "@/components/ui/button";
import { Textarea, Input, Label, FormError } from "@/components/ui/form";

export function NoteForm() {
  const [state, action] = useActionState<NoteFormState, FormData>(postMentorNote, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state.ok]);
  return (
    <form ref={ref} action={action} className="rounded-card border border-gold/40 bg-gold-soft p-3 flex flex-col gap-2">
      <Textarea name="body" rows={3} placeholder="A word for the brothers. It shows at the top of everyone's Today screen." required aria-label="Note" className="bg-surface" />
      <div className="flex items-end justify-between gap-3">
        <div><Label htmlFor="pinned_until" className="text-xs">Keep pinned until (optional)</Label><Input id="pinned_until" name="pinned_until" type="date" className="h-10 w-44 text-sm bg-surface" /></div>
        <SubmitButton variant="gold">Post note</SubmitButton>
      </div>
      <FormError message={state.error} />
    </form>
  );
}

export function DeleteNoteButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return <button type="button" aria-label="Delete note" disabled={pending} onClick={() => { if (confirm("Delete this note?")) start(() => deleteMentorNote(id)); }} className="text-ink-3 hover:text-danger self-start"><Trash2 className="size-4" /></button>;
}

export function ReportActions({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <span className="flex gap-1.5">
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(() => resolveReport(id, "keep"))}>Keep post</Button>
      <Button size="sm" variant="danger" disabled={pending} onClick={() => start(() => resolveReport(id, "hide"))}>Hide post</Button>
    </span>
  );
}
