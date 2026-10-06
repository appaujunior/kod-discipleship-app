"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/button";
import { Input, Label, FormError, FormNotice } from "@/components/ui/form";

export function ForgotPasswordForm() {
  const [state, action] = useActionState<AuthState, FormData>(requestPasswordReset, {});
  return (
    <form action={action} className="w-full mt-6 flex flex-col gap-4">
      <h1 className="display text-2xl font-semibold text-ink text-center">Forgot your password?</h1>
      <p className="text-sm text-ink-2 text-center -mt-2">Enter your email and we&apos;ll send a link to set a new one.</p>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </div>
      <FormError message={state.error} />
      <FormNotice message={state.notice} />
      {!state.notice && <SubmitButton size="lg" className="mt-1">Send reset link</SubmitButton>}
      <p className="text-center text-sm text-ink-3"><Link href="/sign-in" className="font-semibold text-green">Back to sign in</Link></p>
    </form>
  );
}
