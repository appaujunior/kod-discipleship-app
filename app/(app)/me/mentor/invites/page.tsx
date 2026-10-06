import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireSession, isMentor } from "@/lib/auth";
import { parseDateOnly } from "@/lib/utils";
import { PageHeader, Pill, EmptyState, SectionTitle } from "@/components/ui/bits";
import { inviteStatus, INVITE_STATUS_LABEL } from "@/lib/data/invites";
import { NewInviteForm, InviteRowActions, CopyCodeButton } from "./invite-forms";

export const metadata: Metadata = { title: "Invite codes" };

export default async function InvitesPage() {
  const { supabase, profile } = await requireSession();
  if (!isMentor(profile)) redirect("/me");

  const { data: codes } = await supabase.from("invite_codes").select("*").order("created_at", { ascending: false });
  return (
    <div className="flex flex-col gap-6">
      <PageHeader back="/me/mentor" eyebrow="Who gets in" title="Invite codes" />
      <p className="text-sm text-ink-2 -mt-2">
        New members must enter one of these to create an account. Share a code with a brother, then switch it off when
        you&apos;re done with it.
      </p>

      <NewInviteForm />

      <section>
        <SectionTitle>Codes</SectionTitle>
        {!codes?.length ? (
          <EmptyState title="No codes yet" body="Create one above. Until a code exists, nobody new can sign up." />
        ) : (
          <ul className="rounded-card border border-line bg-surface divide-y divide-line">
            {codes.map((c) => {
              const status = inviteStatus(c);
              return (
                <li key={c.code} className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[15px] font-semibold tracking-widest text-ink">{c.code}</span>
                      <Pill tone={status === "live" ? "green" : status === "off" ? "neutral" : "danger"}>
                        {INVITE_STATUS_LABEL[status]}
                      </Pill>
                    </div>
                    <p className="text-xs text-ink-3 mt-0.5 tnum">
                      {c.label ? `${c.label} · ` : ""}
                      {c.uses} used{c.max_uses !== null ? ` of ${c.max_uses}` : ""}
                      {c.expires_at
                        ? ` · until ${parseDateOnly(c.expires_at.slice(0, 10)).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                        : ""}
                    </p>
                  </div>
                  {status === "live" && <CopyCodeButton code={c.code} />}
                  <InviteRowActions code={c.code} active={c.active} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
