"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Check, Copy, Plus, Power, Trash2 } from "lucide-react";
import { createInvite, setInviteActive, deleteInvite, type InviteState } from "@/lib/actions/invites";
import { Button, SubmitButton } from "@/components/ui/button";
import { Input, Label, FormError, Help } from "@/components/ui/form";
import { Card, CardBody } from "@/components/ui/card";

/** Readable code: no O/0 or I/1 to confuse anyone reading it off a screen. */
function suggestCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "KOD-";
  for (let i = 0; i < 4; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export function NewInviteForm() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLFormElement>(null);
  const [state, action] = useActionState<InviteState, FormData>(async (prev, formData) => {
    const result = await createInvite(prev, formData);
    if (result.ok) {
      ref.current?.reset();
      setOpen(false);
    }
    return result;
  }, {});

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden /> New code
      </Button>
    );
  }
  return (
    <Card>
      <CardBody>
        <form ref={ref} action={action} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="i-code">Code</Label>
            <Input
              id="i-code"
              name="code"
              defaultValue={suggestCode()}
              required
              autoFocus
              autoCapitalize="characters"
              spellCheck={false}
              className="font-mono uppercase tracking-widest"
            />
            <Help>Letters, numbers and dashes. Easy to say out loud beats clever.</Help>
          </div>
          <div>
            <Label htmlFor="i-label">What it&apos;s for (optional)</Label>
            <Input id="i-label" name="label" placeholder="e.g. Fall cohort, Tuesday session" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="i-max">Max uses</Label>
              <Input id="i-max" name="max_uses" type="number" inputMode="numeric" min={1} placeholder="Unlimited" />
            </div>
            <div>
              <Label htmlFor="i-exp">Expires</Label>
              <Input id="i-exp" name="expires_on" type="date" />
            </div>
          </div>
          <FormError message={state.error} />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SubmitButton>Create code</SubmitButton>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

export function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={`Copy ${code}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard blocked; the code is on screen to read */
        }
      }}
      className="inline-flex size-8 items-center justify-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-ink"
    >
      {copied ? <Check className="size-4 text-green" /> : <Copy className="size-4" />}
    </button>
  );
}

export function InviteRowActions({ code, active }: { code: string; active: boolean }) {
  const [pending, start] = useTransition();
  return (
    <span className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        aria-label={active ? `Switch off ${code}` : `Switch on ${code}`}
        disabled={pending}
        onClick={() => start(() => setInviteActive(code, !active))}
        className={`inline-flex size-8 items-center justify-center rounded-full hover:bg-surface-2 ${active ? "text-green" : "text-ink-3"}`}
      >
        <Power className="size-4" />
      </button>
      <button
        type="button"
        aria-label={`Delete ${code}`}
        disabled={pending}
        onClick={() => {
          if (confirm(`Delete ${code}? Anyone who hasn't signed up with it yet won't be able to.`)) {
            start(() => deleteInvite(code));
          }
        }}
        className="inline-flex size-8 items-center justify-center rounded-full text-ink-3 hover:bg-surface-2 hover:text-danger"
      >
        <Trash2 className="size-4" />
      </button>
    </span>
  );
}
