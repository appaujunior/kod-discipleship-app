"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { Check, Trash2, Undo2 } from "lucide-react";
import { createPrayer, setPrayerAnswered, deletePrayer, type EntryState } from "@/lib/actions/journal";
import type { PrayerRow as Prayer } from "@/lib/supabase/types";
import { SubmitButton } from "@/components/ui/button";
import { Input, FormError } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export function PrayerForm() {
  const [state, action] = useActionState<EntryState, FormData>(createPrayer, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state.ok]);
  return (
    <form ref={ref} action={action} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input name="title" placeholder="Lord, I'm asking for…" required aria-label="Prayer" />
        <SubmitButton className="shrink-0">Add</SubmitButton>
      </div>
      <Input name="detail" placeholder="Detail (optional)" aria-label="Detail" className="h-10 text-sm" />
      <FormError message={state.error} />
    </form>
  );
}

export function PrayerRow({ prayer }: { prayer: Prayer }) {
  const [pending, start] = useTransition();
  const answered = !!prayer.answered_at;
  return (
    <li className="flex items-center gap-3 px-3 py-2.5">
      <button type="button" aria-pressed={answered} aria-label={answered ? "Mark as still praying" : "Mark answered"} disabled={pending} onClick={() => start(() => setPrayerAnswered(prayer.id, !answered))} className={cn("inline-flex size-7 items-center justify-center rounded-full border-2 shrink-0", answered ? "border-gold bg-gold text-navy" : "border-line-strong text-transparent hover:border-gold")}>
        {answered ? <Check className="size-3.5" strokeWidth={3} /> : <Undo2 className="size-3.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[15px] font-medium", answered ? "text-ink-3" : "text-ink")}>{prayer.title}</p>
        {prayer.detail && <p className="text-sm text-ink-3 truncate">{prayer.detail}</p>}
        {answered && <p className="text-xs text-gold-deep">Answered {new Date(prayer.answered_at!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>}
      </div>
      <button type="button" aria-label="Delete" disabled={pending} onClick={() => start(() => deletePrayer(prayer.id))} className="text-ink-3 hover:text-danger p-1"><Trash2 className="size-4" /></button>
    </li>
  );
}
