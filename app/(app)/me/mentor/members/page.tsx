import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSession, isMentor } from "@/lib/auth";
import { PageHeader, Avatar, Pill } from "@/components/ui/bits";
import { RoleSelect } from "./role-select";
import { ResetPasswordButton } from "./reset-password-button";

export const metadata: Metadata = { title: "Members" };

export default async function MentorMembersPage() {
  const { supabase, userId, profile } = await requireSession();
  if (!isMentor(profile)) redirect("/me");
  const { data: members } = await supabase.from("profiles").select("id, display_name, avatar_url, role, cohort, onboarded, created_at").order("created_at", { ascending: false });
  const isAdmin = profile.role === "admin";
  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/me/mentor" eyebrow={`${members?.length ?? 0} accounts`} title="Members" />
      <ul className="rounded-card border border-line bg-surface divide-y divide-line">
        {(members ?? []).map((m) => (
          <li key={m.id} className="flex flex-wrap items-center gap-x-3 px-4 py-3">
            <Avatar name={m.display_name} src={m.avatar_url} size={36} />
            <div className="min-w-0 flex-1"><p className="font-semibold text-ink truncate">{m.display_name}</p><p className="text-xs text-ink-3">{new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{!m.onboarded && " · not finished setup"}{m.cohort ? ` · ${m.cohort}` : ""}</p></div>
            {isAdmin && m.id !== userId ? <RoleSelect userId={m.id} role={m.role} /> : <Pill tone={m.role === "member" ? "neutral" : "gold"} className="capitalize">{m.role}</Pill>}
            {isAdmin && m.id !== userId && <ResetPasswordButton userId={m.id} name={m.display_name} />}
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-3 px-1">{isAdmin ? "The key resets a member's password when the reset email can't reach him." : "Only an admin can change roles or reset passwords."}</p>
    </div>
  );
}
