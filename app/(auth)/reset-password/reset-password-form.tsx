"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/button";
import { FormError } from "@/components/ui/form";
import { PasswordFields } from "@/components/auth/password-fields";

export function ResetPasswordForm() {
  const [state, action] = useActionState<AuthState, FormData>(updatePassword, {});
  return (
    <form action={action} className="w-full mt-6 flex flex-col gap-4">
      <h1 className="display text-2xl font-semibold text-ink text-center">Set a new password</h1>
      <input type="hidden" name="then" value="today" />
      <PasswordFields />
      <FormError message={state.error} />
      <SubmitButton size="lg" className="mt-1">Save and continue</SubmitButton>
    </form>
  );
}
