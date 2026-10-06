import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { BOOKS, bookBySlug } from "@/lib/bible/books";
import { chapterText } from "@/lib/bible/kjv.server";
import { LinkButton } from "@/components/ui/button";

export async function generateMetadata(props: PageProps<"/word/read/[book]/[chapter]">): Promise<Metadata> {
  const { book, chapter } = await props.params;
  const b = bookBySlug(book);
  return { title: b ? `${b.name} ${chapter}` : "Read" };
}

export default async function ReadPage(props: PageProps<"/word/read/[book]/[chapter]">) {
  const { book: slug, chapter: chapterParam } = await props.params;
  const book = bookBySlug(slug);
  const chapter = Number(chapterParam);
  if (!book || !Number.isInteger(chapter)) notFound();
  const verses = await chapterText(slug, chapter);
  if (!verses) notFound();

  // Prev/next cross book boundaries.
  const idx = BOOKS.findIndex((b) => b.slug === slug);
  const prev = chapter > 1 ? { slug, chapter: chapter - 1 } : idx > 0 ? { slug: BOOKS[idx - 1]!.slug, chapter: BOOKS[idx - 1]!.verses.length } : null;
  const next = chapter < book.verses.length ? { slug, chapter: chapter + 1 } : idx < BOOKS.length - 1 ? { slug: BOOKS[idx + 1]!.slug, chapter: 1 } : null;

  return (
    <article className="flex flex-col gap-5">
      <header className="flex items-center justify-between gap-2">
        <Link href="/word" aria-label="Back to Word" className="-ml-2 inline-flex size-9 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2"><ChevronLeft className="size-5" /></Link>
        <Link href={`/word/books/${slug}`} className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-surface-2">
          <span className="display text-lg font-semibold text-ink">{book.name} <span className="tnum">{chapter}</span></span>
          <LayoutGrid className="size-4 text-ink-3" aria-hidden />
        </Link>
        <span className="size-9" />
      </header>

      <div className="scripture text-[18px] leading-[1.75] text-ink">
        {verses.map((text, i) => (
          <p key={i} id={`v${i + 1}`} className="scroll-mt-20">
            <span className="v">{i + 1}</span>
            {text}
          </p>
        ))}
      </div>

      <nav className="flex items-center justify-between gap-3 pt-2 border-t border-line" aria-label="Chapters">
        {prev ? (
          <LinkButton href={`/word/read/${prev.slug}/${prev.chapter}`} variant="secondary" size="sm"><ChevronLeft className="size-4" aria-hidden /> Previous</LinkButton>
        ) : <span />}
        {next ? (
          <LinkButton href={`/word/read/${next.slug}/${next.chapter}`} variant="secondary" size="sm">Next <ChevronRight className="size-4" aria-hidden /></LinkButton>
        ) : <span />}
      </nav>
      <p className="text-xs text-ink-3 text-center">King James Version</p>
    </article>
  );
}
