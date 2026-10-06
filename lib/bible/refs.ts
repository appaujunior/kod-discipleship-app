import { BOOKS, bookByName, type BibleBook } from "./books";

/** A passage: one book, a chapter range, and optionally a verse range within a single chapter. */
export interface Passage {
  book: BibleBook;
  chapterStart: number;
  chapterEnd: number;
  verseStart?: number;
  verseEnd?: number;
}

const REF_RE = /^(\d?\s?[A-Za-z ]+?)\s+(\d+)(?::(\d+)(?:-(\d+))?)?(?:-(\d+))?$/;

/** Parse "John 3:16", "Psalm 23:1-4", "Genesis 1-3", "1 Corinthians 13". */
export function parseRef(ref: string): Passage | null {
  const m = ref.trim().match(REF_RE);
  if (!m) return null;
  const [, rawBook, ch, vs, ve, chEnd] = m;
  const bookName = normalizeBookName(rawBook.trim());
  const book = bookByName(bookName);
  if (!book) return null;
  const chapterStart = Number(ch);
  if (chapterStart < 1 || chapterStart > book.verses.length) return null;
  if (vs) {
    return { book, chapterStart, chapterEnd: chapterStart, verseStart: Number(vs), verseEnd: ve ? Number(ve) : Number(vs) };
  }
  return { book, chapterStart, chapterEnd: chEnd ? Number(chEnd) : chapterStart };
}

const ALIASES: Record<string, string> = {
  psalm: "Psalms", ps: "Psalms", prov: "Proverbs", eccl: "Ecclesiastes", "song of songs": "Song of Solomon",
  matt: "Matthew", mk: "Mark", lk: "Luke", jn: "John", rom: "Romans", cor: "Corinthians", gal: "Galatians",
  eph: "Ephesians", phil: "Philippians", col: "Colossians", thess: "Thessalonians", tim: "Timothy",
  heb: "Hebrews", jas: "James", pet: "Peter", rev: "Revelation", gen: "Genesis", ex: "Exodus", deut: "Deuteronomy",
  isa: "Isaiah", jer: "Jeremiah", dan: "Daniel",
};

function normalizeBookName(name: string): string {
  const lower = name.toLowerCase().replace(/\.$/, "");
  if (ALIASES[lower]) return ALIASES[lower];
  const m = lower.match(/^(\d)\s*(\w+)$/);
  if (m && ALIASES[m[2]]) return `${m[1]} ${ALIASES[m[2]]}`;
  return name;
}

export function formatPassage(p: Passage): string {
  const b = p.book.name;
  if (p.verseStart) {
    return p.verseStart === p.verseEnd
      ? `${b} ${p.chapterStart}:${p.verseStart}`
      : `${b} ${p.chapterStart}:${p.verseStart}-${p.verseEnd}`;
  }
  return p.chapterStart === p.chapterEnd ? `${b} ${p.chapterStart}` : `${b} ${p.chapterStart}-${p.chapterEnd}`;
}

/** Route for the in-app reader. */
export function readerHref(p: Passage): string {
  const v = p.verseStart ? `#v${p.verseStart}` : "";
  return `/word/read/${p.book.slug}/${p.chapterStart}${v}`;
}

export { BOOKS };
