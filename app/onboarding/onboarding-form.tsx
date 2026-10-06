"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { completeOnboarding, type OnboardingState } from "@/lib/actions/onboarding";
import { PLANS } from "@/lib/bible/plans";
import { SubmitButton } from "@/components/ui/button";
import { Input, Label, FormError, Help } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export function OnboardingForm({ defaultName, defaultCohort }: { defaultName: string; defaultCohort: string }) {
  const [state, action] = useActionState<OnboardingState, FormData>(completeOnboarding, {});
  const [plan, setPlan] = useState(PLANS[0]!.slug);
  const timezoneRef = useRef<HTMLInputElement>(null);

  // Read the browser's time zone after mount and write it straight to the field,
  // so the server never has to guess and the markup still matches on hydration.
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && timezoneRef.current) timezoneRef.current.value = tz;
    } catch {
      /* keep the default */
    }
  }, []);

  return (
    <form action={action} className="w-full mt-6 flex flex-col gap-5">
      <h1 className="display text-2xl font-semibold text-ink text-center text-balance">Three things, then you&apos;re in.</h1>
      <input ref={timezoneRef} type="hidden" name="timezone" defaultValue="America/Chicago" />
      <input type="hidden" name="plan" value={plan} />

      <div>
        <Label htmlFor="name">What do you go by?</Label>
        <Input id="name" name="name" defaultValue={defaultName} required minLength={2} />
        <Help>This is how brothers will see you in the feed.</Help>
      </div>

      <div>
        <Label htmlFor="cohort">Your cohort or year (optional)</Label>
        <Input id="cohort" name="cohort" defaultValue={defaultCohort} placeholder="e.g. 2026" />
      </div>

      <fieldset>
        <legend className="block text-sm font-semibold text-ink-2 mb-1.5">Pick a reading plan</legend>
        <div className="flex flex-col gap-2">
          {PLANS.map((p) => {
            const active = plan === p.slug;
            return (
              <button
                key={p.slug}
                type="button"
                onClick={() => setPlan(p.slug)}
                aria-pressed={active}
                className={cn(
                  "text-left rounded-xl border px-4 py-3 transition-colors",
                  active ? "border-green bg-green-soft" : "border-line bg-surface hover:bg-surface-2",
                )}
              >
                <span className="block font-semibold text-ink">{p.title}</span>
                <span className="block text-sm text-ink-3">{p.tagline}</span>
              </button>
            );
          })}
        </div>
        <Help>King James Version. You can switch or add a plan any time.</Help>
      </fieldset>

      <FormError message={state.error} />
      <SubmitButton size="lg">Enter KOD</SubmitButton>
    </form>
  );
}
