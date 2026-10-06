"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { createEntry, deleteEntry, type EntryState } from "@/lib/actions/journal";
import { JOURNAL_PROMPTS } from "@/lib/data/journal";
import { SubmitButton } from "@/components/ui/button";
import { Textarea, Input, Label, FormError } from "@/components/ui/form";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MOODS = ["steady", "grateful", "tired", "struggling", "fired up"];

/** Guided evening entry: three prompts, an optional free-write, a mood and a date. */
export function JournalForm({ today }: { today: string }) {
  const [mood, setMood] = useState("");
  const [freeWrite, setFreeWrite] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState<EntryState, FormData>(async (prev, formData) => {
    const result = await createEntry(prev, formData);
    if (result.ok) {
      ref.current?.reset();
      setMood("");
      setFreeWrite(false);
    }
    return result;
  }, {});
  return (
    <Card>
      <CardBody>
        <form ref={ref} action={action} className="flex flex-col gap-4">
          <input type="hidden" name="mood" value={mood} />
          {JOURNAL_PROMPTS.map((p, i) => (
            <div key={p.key}>
              <Label htmlFor={`j-${p.key}`} className="flex gap-2 text-ink">
                <span className="display text-gold-deep tnum">{i + 1}</span>{p.question}
              </Label>
              <Textarea id={`j-${p.key}`} name={p.key} placeholder={p.placeholder} rows={2} maxLength={2000} className="min-h-16" />
            </div>
          ))}
          {freeWrite ? (
            <div>
              <Label htmlFor="j-body">Anything else on your heart</Label>
              <Textarea id="j-body" name="body" placeholder="What happened today? Where was God in it?" rows={3} maxLength={4000} autoFocus />
            </div>
          ) : (
            <button type="button" onClick={() => setFreeWrite(true)} className="self-start text-sm font-semibold text-green">+ Free write</button>
          )}
          <div className="flex flex-wrap gap-1.5" aria-label="Mood">
            {MOODS.map((m) => (
              <button key={m} type="button" onClick={() => setMood(mood === m ? "" : m)} aria-pressed={mood === m} className={cn("rounded-full border px-3 py-1 text-xs font-semibold transition-colors", mood === m ? "border-green bg-green-soft text-green" : "border-line text-ink-3 hover:text-ink")}>{m}</button>
            ))}
          </div>
          <div className="flex items-end justify-between gap-3">
            <div><Label htmlFor="entry_date" className="text-xs">Date</Label><Input id="entry_date" name="entry_date" type="date" defaultValue={today} className="h-10 w-44 text-sm" /></div>
            <SubmitButton>Save entry</SubmitButton>
          </div>
          <FormError message={state.error} />
        </form>
      </CardBody>
    </Card>
  );
}

export function DeleteEntryButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return <button type="button" aria-label="Delete entry" disabled={pending} onClick={() => { if (confirm("Delete this entry?")) start(() => deleteEntry(id)); }} className="text-ink-3 hover:text-danger"><Trash2 className="size-4" /></button>;
}
