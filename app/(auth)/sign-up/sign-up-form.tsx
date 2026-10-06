"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/button";
import { Input, Label, FormError, FormNotice, Help } from "@/components/ui/form";

export function SignUpForm() {
  const [state, action] = useActionState<AuthState, FormData>(signUp, {});
  return (
    <form action={action} className="w-full mt-6 flex flex-col gap-4">
      <h1 className="display text-2xl font-semibold text-ink text-center">Join the brotherhood.</h1>
      <div>
        <Label htmlFor="name">What do you go by?</Label>
        <Input id="name" name="name" autoComplete="given-name" placeholder="First name or nickname" required minLength={2} />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
        <Help>At least 8 characters.</Help>
      </div>
      <div>
        <Label htmlFor="invite_code">Invite code</Label>
        <Input id="invite_code" name="invite_code" required autoCapitalize="characters" autoComplete="off" spellCheck={false} placeholder="From your mentor" className="uppercase tracking-widest" />
        <Help>KOD is invite only. A mentor will give you the code.</Help>
      </div>
      <FormError message={state.error} />
      <FormNotice message={state.notice} />
      <SubmitButton size="lg" className="mt-1">Create account</SubmitButton>
      <p className="text-center text-sm text-ink-3">
        Already a member?{" "}
        <Link href="/sign-in" className="font-semibold text-green">
          Sign in
        </Link>
      </p>
    </form>
  );
}
