import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui/bits";
import { SettingsForm } from "./settings-form";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { profile } = await requireSession();
  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/me" title="Settings" />
      <SettingsForm profile={{ display_name: profile.display_name, cohort: profile.cohort ?? "", bio: profile.bio ?? "", timezone: profile.timezone, avatar_url: profile.avatar_url ?? "" }} />
      <PasswordForm />
      <p className="text-xs text-ink-3 px-1">To install KOD on your phone: open this site in Safari or Chrome, tap Share, then “Add to Home Screen.”</p>
    </div>
  );
}
