import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { Avatar, Pill } from "@/components/ui/bits";
import { PartnerRequestButton } from "../partners/partner-buttons";

export const metadata: Metadata = { title: "Members" };

export default async function MembersPage() {
  const { supabase, userId } = await requireSession();
  const [{ data: members }, { data: partnerships }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_url, role, cohort, created_at").eq("onboarded", true).order("display_name"),
    supabase.from("partnerships").select("id, requester_id, partner_id, status").or(`requester_id.eq.${userId},partner_id.eq.${userId}`).neq("status", "ended"),
  ]);
  const linked = new Set((partnerships ?? []).flatMap((p) => [p.requester_id, p.partner_id]));

  return (
    <ul className="rounded-card border border-line bg-surface divide-y divide-line">
      {(members ?? []).map((m) => (
        <li key={m.id} className="flex items-center gap-3 px-4 py-3">
          <Avatar name={m.display_name} src={m.avatar_url} size={40} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2"><span className="font-semibold text-ink truncate">{m.display_name}{m.id === userId && <span className="text-ink-3 font-normal"> (you)</span>}</span>{m.role !== "member" && <Pill tone="gold" className="capitalize">{m.role}</Pill>}</div>
            <p className="text-xs text-ink-3">{m.cohort ? `Cohort ${m.cohort} · ` : ""}Since {new Date(m.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}</p>
          </div>
          {m.id !== userId && !linked.has(m.id) && <PartnerRequestButton partnerId={m.id} />}
        </li>
      ))}
    </ul>
  );
}
