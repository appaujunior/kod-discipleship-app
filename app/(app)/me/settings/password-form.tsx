"use client";

import { useActionState, useEffect, useRef } from "react";
import { updatePassword, type AuthState } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/ui/button";
import { FormError, FormNotice } from "@/components/ui/form";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordFields } from "@/components/auth/password-fields";

export function PasswordForm() {
  const [state, action] = useActionState<AuthState, FormData>(updatePassword, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.notice) ref.current?.reset(); }, [state.notice]);
  return (
    <Card>
      <CardHeader><CardTitle>Change password</CardTitle></CardHeader>
      <CardBody>
        <form ref={ref} action={action} className="flex flex-col gap-4">
          <PasswordFields />
          <FormError message={state.error} />
          <FormNotice message={state.notice} />
          <SubmitButton variant="secondary" className="self-end">Update password</SubmitButton>
        </form>
      </CardBody>
    </Card>
  );
}
