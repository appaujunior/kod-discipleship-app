import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { todayIn } from "@/lib/utils";
import { habitsWithLogs, weekEnding } from "@/lib/queries/habits";
import { Avatar, EmptyState, SectionTitle, ProgressBar } from "@/components/ui/bits";
import { Card, CardBody } from "@/components/ui/card";
import { RespondButtons, EndButton } from "./partner-buttons";

export const metadata: Metadata = { title: "Partners" };

export default async function PartnersPage() {
  const { supabase, userId, profile } = await requireSession();
  const today = todayIn(profile.timezone);
  const days = weekEnding(today);
  const { data: rows } = await supabase
    .from("partnerships")
    .select("id, requester_id, partner_id, status, requester:profiles!partnerships_requester_id_fkey(id, display_name, avatar_url), partner:profiles!partnerships_partner_id_fkey(id, display_name, avatar_url)")
    .or(`requester_id.eq.${userId},partner_id.eq.${userId}`)
    .neq("status", "ended")
    .overrideTypes<{ id: string; requester_id: string; partner_id: string; status: string; requester: { id: string; display_name: string; avatar_url: string | null }; partner: { id: string; display_name: string; avatar_url: string | null } }[], { merge: false }>();

  const incoming = (rows ?? []).filter((r) => r.status === "pending" && r.partner_id === userId);
  const outgoing = (rows ?? []).filter((r) => r.status === "pending" && r.requester_id === userId);
  const active = (rows ?? []).filter((r) => r.status === "active");

  // Each active partner's week, visible thanks to the partner-read policy.
  const partnerWeeks = await Promise.all(
    active.map(async (r) => {
      const other = r.requester_id === userId ? r.partner : r.requester;
      const habits = await habitsWithLogs(supabase, other.id, days[0]!, today);
      const target = habits.reduce((n, h) => n + h.target_per_week, 0);
      const done = habits.reduce((n, h) => n + Math.min(h.doneOn.size, h.target_per_week), 0);
      const todayDone = habits.filter((h) => h.doneOn.has(today)).length;
      return { partnership: r, other, target, done, todayDone, habitCount: habits.length };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      {incoming.length > 0 && (
        <section>
          <SectionTitle>Wants to partner with you</SectionTitle>
          <ul className="rounded-card border border-line bg-surface divide-y divide-line">
            {incoming.map((r) => <li key={r.id} className="flex items-center gap-3 px-4 py-3"><Avatar name={r.requester.display_name} src={r.requester.avatar_url} /><span className="flex-1 font-semibold text-ink">{r.requester.display_name}</span><RespondButtons id={r.id} /></li>)}
          </ul>
        </section>
      )}
      <section>
        <SectionTitle>Accountability partners</SectionTitle>
        {partnerWeeks.length === 0 ? (
          <EmptyState title="No partner yet" body="Two men who check on each other daily outlast one man with willpower." action={<Link href="/brothers/members" className="text-sm font-semibold text-green">Find a brother</Link>} />
        ) : (
          <div className="flex flex-col gap-3">
            {partnerWeeks.map(({ partnership, other, target, done, todayDone, habitCount }) => (
              <Card key={partnership.id}>
                <CardBody className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Avatar name={other.display_name} src={other.avatar_url} size={40} />
                    <div className="min-w-0 flex-1"><p className="font-semibold text-ink">{other.display_name}</p><p className="text-xs text-ink-3 tnum">{todayDone}/{habitCount} habits today</p></div>
                    <EndButton id={partnership.id} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-ink-3 tnum"><span>This week</span><span>{done}/{target}</span></div>
                  <ProgressBar value={done} max={Math.max(1, target)} />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>
      {outgoing.length > 0 && (
        <section>
          <SectionTitle>Waiting on</SectionTitle>
          <ul className="rounded-card border border-line bg-surface divide-y divide-line">
            {outgoing.map((r) => <li key={r.id} className="flex items-center gap-3 px-4 py-3"><Avatar name={r.partner.display_name} src={r.partner.avatar_url} /><span className="flex-1 text-ink">{r.partner.display_name}</span><span className="text-xs text-ink-3">Pending</span></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
