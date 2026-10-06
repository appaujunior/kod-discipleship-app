import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { memoryVerseById, LEVELS } from "@/lib/bible/memory-verses";
import { verseText } from "@/lib/bible/kjv.server";
import { PageHeader, Pill } from "@/components/ui/bits";
import { Card, CardBody } from "@/components/ui/card";
import { VersePractice } from "./verse-practice";

export async function generateMetadata(props: PageProps<"/word/memory/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  return { title: memoryVerseById(Number(id))?.ref ?? "Verse" };
}

export default async function MemoryVersePage(props: PageProps<"/word/memory/[id]">) {
  const { id } = await props.params;
  const verse = memoryVerseById(Number(id));
  if (!verse) notFound();
  const { supabase, userId } = await requireSession();
  const [text, { data: p }] = await Promise.all([
    verseText(verse.ref),
    supabase.from("memory_progress").select("status, review_count").eq("user_id", userId).eq("verse_id", verse.id).maybeSingle(),
  ]);
  if (!text) notFound();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/word/memory" eyebrow={`Level ${verse.level} · ${LEVELS[verse.level].name}`} title={verse.ref} action={p?.status === "mastered" ? <Pill tone="gold">Mastered</Pill> : p ? <Pill tone="green">Review {p.review_count}/3</Pill> : null} />
      <Card className="bg-navy border-navy text-white">
        <CardBody>
          <blockquote className="text-[20px] leading-relaxed" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>“{text}”</blockquote>
          <p className="display text-sm text-gold mt-3">{verse.ref} · KJV</p>
        </CardBody>
      </Card>
      <VersePractice verseId={verse.id} text={text} reviewCount={p?.review_count ?? 0} mastered={p?.status === "mastered"} />
    </div>
  );
}
