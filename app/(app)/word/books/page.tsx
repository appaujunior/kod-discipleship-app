import type { Metadata } from "next";
import Link from "next/link";
import { BOOKS } from "@/lib/bible/books";
import { PageHeader, SectionTitle } from "@/components/ui/bits";

export const metadata: Metadata = { title: "Books" };

function BookList({ testament }: { testament: "OT" | "NT" }) {
  return (
    <ul className="rounded-card border border-line bg-surface divide-y divide-line">
      {BOOKS.filter((b) => b.testament === testament).map((b) => (
        <li key={b.slug}>
          <Link href={`/word/books/${b.slug}`} className="flex items-center justify-between px-4 py-2.5 text-[15px] text-ink hover:bg-surface-2">
            <span>{b.name}</span>
            <span className="text-xs text-ink-3 tnum">{b.verses.length} ch</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function BooksPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader back="/word" eyebrow="King James Version" title="Books" />
      <section><SectionTitle>Old Testament</SectionTitle><BookList testament="OT" /></section>
      <section><SectionTitle>New Testament</SectionTitle><BookList testament="NT" /></section>
    </div>
  );
}
