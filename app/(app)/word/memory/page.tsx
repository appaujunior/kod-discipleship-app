import type { Metadata } from "next";
import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { MEMORY_VERSES, LEVELS } from "@/lib/bible/memory-verses";
import { PageHeader, ProgressBar, Pill } from "@/components/ui/bits";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Memory verses" };

export default async function MemoryPage() {
  const { supabase, userId } = await requireSession();
  const { data: progress } = await supabase.from("memory_progress").select("verse_id, status, review_count").eq("user_id", userId);
  const byId = new Map((progress ?? []).map((p) => [p.verse_id, p]));
  const mastered = (progress ?? []).filter((p) => p.status === "mastered").length;

  // A level unlocks once the previous level is fully mastered.
  const masteredInLevel = (level: number) => MEMORY_VERSES.filter((v) => v.level === level && byId.get(v.id)?.status === "mastered").length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/word" eyebrow="Hide it in your heart" title="Memory verses" />
      <Card>
        <CardBody className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-2">Mastered</span>
            <span className="tnum font-semibold text-ink">{mastered} / {MEMORY_VERSES.length}</span>
          </div>
          <ProgressBar value={mastered} max={MEMORY_VERSES.length} tone="gold" />
          <p className="text-xs text-ink-3">Review a verse three times to master it. Each level opens when the one before is complete.</p>
        </CardBody>
      </Card>

      {([1, 2, 3, 4, 5] as const).map((level) => {
        const unlocked = level === 1 || masteredInLevel(level - 1) === 10;
        const verses = MEMORY_VERSES.filter((v) => v.level === level);
        return (
          <section key={level}>
            <div className="flex items-center justify-between mb-2">
              <h2 className="eyebrow">Level {level} · {LEVELS[level].name}</h2>
              <span className="text-xs text-ink-3 tnum">{masteredInLevel(level)}/10</span>
            </div>
            <p className="text-sm text-ink-3 mb-2.5">{LEVELS[level].theme}</p>
            <ul className={cn("rounded-card border border-line bg-surface divide-y divide-line", !unlocked && "opacity-60")}>
              {verses.map((v) => {
                const p = byId.get(v.id);
                const status = p?.status ?? "new";
                const inner = (
                  <>
                    <span className={cn("inline-flex size-7 items-center justify-center rounded-full border-2 shrink-0", status === "mastered" ? "border-gold bg-gold text-navy" : status === "learning" ? "border-green text-green" : "border-line-strong text-transparent")} aria-hidden>
                      {status === "mastered" ? <Check className="size-3.5" strokeWidth={3} /> : <span className="text-[11px] font-bold tnum text-inherit">{p?.review_count ?? ""}</span>}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold text-ink">{v.ref}</span>
                      <span className="block text-sm text-ink-3 truncate">{v.gist}</span>
                    </span>
                    {!unlocked ? <Lock className="size-4 text-ink-3" aria-label="Locked" /> : status === "learning" ? <Pill tone="green">Learning</Pill> : null}
                  </>
                );
                return (
                  <li key={v.id}>
                    {unlocked ? (
                      <Link href={`/word/memory/${v.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">{inner}</Link>
                    ) : (
                      <div className="flex items-center gap-3 px-4 py-3">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
