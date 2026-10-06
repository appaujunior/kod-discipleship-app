import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { todayIn } from "@/lib/utils";
import { memberStats } from "@/lib/queries/me";
import { MERCH, UNLOCKS, STORE_URL } from "@/lib/data/merch";
import { PageHeader, SectionTitle, ProgressBar, Pill } from "@/components/ui/bits";
import { Card, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = { title: "Vault" };

export default async function VaultPage() {
  const { supabase, userId, profile } = await requireSession();
  const stats = await memberStats(supabase, userId, todayIn(profile.timezone));
  return (
    <div className="flex flex-col gap-6">
      <PageHeader back="/me" eyebrow="Earn it" title="Vault" />
      <section>
        <SectionTitle>Unlocks</SectionTitle>
        <div className="flex flex-col gap-3">
          {UNLOCKS.map((u) => {
            const { current, target } = u.progress(stats);
            const unlocked = current >= target;
            return (
              <Card key={u.code} className={unlocked ? "border-gold/60 bg-gold-soft" : undefined}>
                <CardBody className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2"><p className="font-semibold text-ink">{u.discount}</p>{unlocked ? <Pill tone="gold">Unlocked</Pill> : <span className="text-xs text-ink-3 tnum">{current}/{target}</span>}</div>
                  <p className="text-sm text-ink-2">{u.requirement}</p>
                  {unlocked ? <p className="font-mono text-sm text-ink bg-surface rounded-lg px-3 py-2 border border-line select-all">{u.code}</p> : <ProgressBar value={current} max={target} tone="gold" />}
                </CardBody>
              </Card>
            );
          })}
        </div>
      </section>
      <section>
        <SectionTitle>KOD gear</SectionTitle>
        <ul className="rounded-card border border-line bg-surface divide-y divide-line">
          {MERCH.map((m) => <li key={m.slug} className="flex items-center justify-between px-4 py-3"><span><span className="block font-semibold text-ink">{m.title}</span><span className="block text-xs text-ink-3">{m.category}</span></span><span className="tnum font-semibold text-ink">${m.price}</span></li>)}
        </ul>
        <LinkButton href={STORE_URL} target="_blank" rel="noreferrer" variant="secondary" className="mt-3 w-full">Open the store</LinkButton>
      </section>
    </div>
  );
}
