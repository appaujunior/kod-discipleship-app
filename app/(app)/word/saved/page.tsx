import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { verseText } from "@/lib/bible/kjv.server";
import { parseRef, readerHref } from "@/lib/bible/refs";
import { PageHeader, SectionTitle, EmptyState } from "@/components/ui/bits";
import { SaveButton } from "@/components/word/save-button";

export const metadata: Metadata = { title: "Saved" };

export default async function SavedPage() {
  const { supabase, userId } = await requireSession();
  const { data: items } = await supabase.from("saved_items").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  const verses = (items ?? []).filter((i) => i.kind === "verse");
  const videoIds = (items ?? []).filter((i) => i.kind === "video").map((i) => i.ref);
  const [{ data: videos }, texts] = await Promise.all([
    videoIds.length ? supabase.from("videos").select("id, title, channel").in("id", videoIds) : Promise.resolve({ data: [] as { id: string; title: string; channel: string | null }[] }),
    Promise.all(verses.map((v) => verseText(v.ref))),
  ]);

  const empty = verses.length === 0 && (videos?.length ?? 0) === 0;
  return (
    <div className="flex flex-col gap-6">
      <PageHeader back="/word" eyebrow="Yours to keep" title="Saved" />
      {empty && <EmptyState title="Nothing saved yet" body="Tap the bookmark on a verse or a video and it lands here." />}
      {verses.length > 0 && (
        <section>
          <SectionTitle>Verses</SectionTitle>
          <ul className="flex flex-col gap-3">
            {verses.map((v, i) => {
              const p = parseRef(v.ref);
              return (
                <li key={v.id} className="rounded-card border border-line bg-surface px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    {p ? <Link href={readerHref(p)} className="display text-sm font-semibold text-green">{v.ref}</Link> : <span className="display text-sm font-semibold">{v.ref}</span>}
                    <SaveButton kind="verse" refValue={v.ref} saved />
                  </div>
                  {texts[i] && <p className="text-[15px] leading-relaxed text-ink-2 mt-1">{texts[i]}</p>}
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {(videos?.length ?? 0) > 0 && (
        <section>
          <SectionTitle>Videos</SectionTitle>
          <ul className="rounded-card border border-line bg-surface divide-y divide-line">
            {videos!.map((v) => (
              <li key={v.id} className="flex items-center gap-3 px-4 py-3">
                <Link href={`/word/videos/${v.id}`} className="min-w-0 flex-1">
                  <span className="block font-semibold text-ink truncate">{v.title}</span>
                  <span className="block text-sm text-ink-3 truncate">{v.channel}</span>
                </Link>
                <SaveButton kind="video" refValue={v.id} saved />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
