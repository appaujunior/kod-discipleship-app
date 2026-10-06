import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { bookBySlug } from "./books";
import { parseRef, type Passage } from "./refs";

interface BookFile {
  book: string;
  slug: string;
  chapters: string[][];
}

const cache = new Map<string, Promise<BookFile>>();

/** Load one book of the KJV from public/bible/kjv (cached per process). */
export function loadBook(slug: string): Promise<BookFile> {
  let p = cache.get(slug);
  if (!p) {
    const file = path.join(process.cwd(), "public", "bible", "kjv", `${slug}.json`);
    p = readFile(file, "utf8").then((t) => JSON.parse(t) as BookFile);
    cache.set(slug, p);
  }
  return p;
}

export interface Verse {
  chapter: number;
  verse: number;
  text: string;
}

/** Verses for a passage (single chapter with verse range, or a chapter range). */
export async function passageVerses(p: Passage): Promise<Verse[]> {
  const book = await loadBook(p.book.slug);
  const out: Verse[] = [];
  for (let c = p.chapterStart; c <= p.chapterEnd; c++) {
    const verses = book.chapters[c - 1] ?? [];
    const from = p.verseStart ?? 1;
    const to = p.verseEnd ?? verses.length;
    for (let v = from; v <= Math.min(to, verses.length); v++) {
      out.push({ chapter: c, verse: v, text: verses[v - 1]! });
    }
  }
  return out;
}

/** Text of a reference like "John 3:16" joined into one string, or null if it doesn't parse. */
export async function verseText(ref: string): Promise<string | null> {
  const p = parseRef(ref);
  if (!p) return null;
  const verses = await passageVerses(p);
  return verses.map((v) => v.text).join(" ");
}

export async function chapterText(slug: string, chapter: number): Promise<string[] | null> {
  const meta = bookBySlug(slug);
  if (!meta || chapter < 1 || chapter > meta.verses.length) return null;
  const book = await loadBook(slug);
  return book.chapters[chapter - 1] ?? null;
}
