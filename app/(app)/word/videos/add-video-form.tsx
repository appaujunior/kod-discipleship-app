"use client";

import { useActionState, useEffect, useRef } from "react";
import { addVideo, type VideoFormState } from "@/lib/actions/word";
import { SubmitButton } from "@/components/ui/button";
import { Input, Label, FormError, FormNotice } from "@/components/ui/form";
import { Card, CardBody } from "@/components/ui/card";

export function AddVideoForm() {
  const [state, action] = useActionState<VideoFormState, FormData>(addVideo, {});
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) formRef.current?.reset(); }, [state.ok]);
  return (
    <Card className="border-gold/40">
      <CardBody>
        <form ref={formRef} action={action} className="flex flex-col gap-3">
          <p className="eyebrow">Mentor tools · Add a video</p>
          <div>
            <Label htmlFor="url">YouTube link</Label>
            <Input id="url" name="url" placeholder="https://youtu.be/…" inputMode="url" required />
          </div>
          <div>
            <Label htmlFor="topic">Topic (optional)</Label>
            <Input id="topic" name="topic" placeholder="Faith, Purpose, Discipline…" />
          </div>
          <FormError message={state.error} />
          <FormNotice message={state.ok ? "Added to the library." : null} />
          <SubmitButton variant="gold" size="sm" className="self-start">Add video</SubmitButton>
        </form>
      </CardBody>
    </Card>
  );
}
