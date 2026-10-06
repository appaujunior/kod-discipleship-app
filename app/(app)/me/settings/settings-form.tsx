"use client";

import { useActionState } from "react";
import { updateProfile, type MeState } from "@/lib/actions/me";
import { SubmitButton } from "@/components/ui/button";
import { Input, Label, Textarea, FormError, FormNotice, Help } from "@/components/ui/form";
import { Card, CardBody } from "@/components/ui/card";

export function SettingsForm({ profile }: { profile: { display_name: string; cohort: string; bio: string; timezone: string; avatar_url: string } }) {
  const [state, action] = useActionState<MeState, FormData>(updateProfile, {});
  return (
    <Card><CardBody>
      <form action={action} className="flex flex-col gap-4">
        <div><Label htmlFor="display_name">Name</Label><Input id="display_name" name="display_name" defaultValue={profile.display_name} required minLength={2} /></div>
        <div><Label htmlFor="cohort">Cohort</Label><Input id="cohort" name="cohort" defaultValue={profile.cohort} placeholder="e.g. 2026" /></div>
        <div><Label htmlFor="bio">About you</Label><Textarea id="bio" name="bio" defaultValue={profile.bio} rows={3} maxLength={280} placeholder="One or two lines the brothers should know." /></div>
        <div><Label htmlFor="avatar_url">Photo link (optional)</Label><Input id="avatar_url" name="avatar_url" defaultValue={profile.avatar_url} placeholder="https://…" inputMode="url" /><Help>Paste a link to a photo. Uploads come in a later version.</Help></div>
        <div><Label htmlFor="timezone">Time zone</Label><Input id="timezone" name="timezone" defaultValue={profile.timezone} /><Help>Controls when “today” rolls over for habits. Memphis is America/Chicago.</Help></div>
        <FormError message={state.error} />
        <FormNotice message={state.ok ? "Saved." : null} />
        <SubmitButton className="self-end">Save changes</SubmitButton>
      </form>
    </CardBody></Card>
  );
}
