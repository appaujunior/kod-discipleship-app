import type { Metadata } from "next";
import { BookOpen, Brain, Bookmark, Library, PlayCircle } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { nextReadings, allPlans } from "@/lib/queries/word";
import { MEMORY_VERSES } from "@/lib/bible/memory-verses";
import { PageHeader, RowLink, SectionTitle, Pill } from "@/components/ui/bits";
import { Card } from "@/components/ui/card";
import { ReadingCard } from "@/components/word/reading-card";
import { PlanJoinButton } from "./plan-join-button";

export const metadata: Metadata = { title: "Word" };

export default async function WordPage() {
  const { supabase, userId } = await requireSession();
  const [readings, { count: mastered }, { count: savedCount }, { count: videoCount }] = await Promise.all([
    nextReadings(supabase, userId),
    supabase.from("memory_progress").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "mastered"),
    supabase.from("saved_items").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("videos").select("id", { count: "exact", head: true }),
  ]);
  const joined = new Set(readings.map((r) => r.plan.slug));
  const notJoined = allPlans().filter((p) => !joined.has(p.slug));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader eyebrow="Book & torch" title="Word" />

      <section>
        <SectionTitle>Reading plans</SectionTitle>
        <div className="flex flex-col gap-3">
          {readings.map((r) => <ReadingCard key={r.plan.slug} reading={r} />)}
          {notJoined.map((p) => (
            <Card key={p.slug} className="px-4 py-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-ink">{p.title}</p>
                <p className="text-sm text-ink-3">{p.tagline}</p>
              </div>
              <PlanJoinButton slug={p.slug} />
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Library</SectionTitle>
        <Card className="divide-y divide-line overflow-hidden">
          <RowLink href="/word/books" title="Read the Bible" meta="King James Version, all 66 books" icon={<BookOpen className="size-[18px]" />} />
          <RowLink href="/word/memory" title="Memory verses" meta="50 verses in five levels" icon={<Brain className="size-[18px]" />} right={<Pill tone="green" className="tnum">{mastered ?? 0}/{MEMORY_VERSES.length}</Pill>} />
          <RowLink href="/word/videos" title="Teaching videos" meta={`${videoCount ?? 0} in the library`} icon={<PlayCircle className="size-[18px]" />} />
          <RowLink href="/word/saved" title="Saved" meta={`${savedCount ?? 0} verses and videos`} icon={<Bookmark className="size-[18px]" />} />
        </Card>
      </section>

      <p className="flex items-center gap-2 text-xs text-ink-3 px-1"><Library className="size-3.5" aria-hidden /> Scripture text is the King James Version, public domain.</p>
    </div>
  );
}
