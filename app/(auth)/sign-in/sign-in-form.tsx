"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/button";
import { Input, Label, FormError } from "@/components/ui/form";

export function SignInForm({ next, linkError }: { next?: string; linkError?: boolean }) {
  const [state, action] = useActionState<AuthState, FormData>(signIn, {});
  return (
    <form action={action} className="w-full mt-6 flex flex-col gap-4">
      <h1 className="display text-2xl font-semibold text-ink text-center">Welcome back, King.</h1>
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href="/forgot-password" className="text-sm font-semibold text-green">Forgot?</Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <FormError message={state.error ?? (linkError ? "That link expired or was opened on a different device. Request a new one from “Forgot?” on this phone." : undefined)} />
      <SubmitButton size="lg" className="mt-1">Sign in</SubmitButton>
      <p className="text-center text-sm text-ink-3">
        New here?{" "}
        <Link href="/sign-up" className="font-semibold text-green">
          Create your account
        </Link>
      </p>
    </form>
  );
}
