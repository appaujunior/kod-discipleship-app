import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bookBySlug } from "@/lib/bible/books";
import { PageHeader } from "@/components/ui/bits";

export async function generateMetadata(props: PageProps<"/word/books/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  return { title: bookBySlug(slug)?.name ?? "Book" };
}

export default async function BookPage(props: PageProps<"/word/books/[slug]">) {
  const { slug } = await props.params;
  const book = bookBySlug(slug);
  if (!book) notFound();
  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/word/books" eyebrow={book.testament === "OT" ? "Old Testament" : "New Testament"} title={book.name} />
      <div className="grid grid-cols-6 gap-2">
        {book.verses.map((_, i) => (
          <Link key={i} href={`/word/read/${book.slug}/${i + 1}`} className="aspect-square rounded-lg border border-line bg-surface grid place-items-center text-[15px] font-semibold text-ink tnum hover:bg-surface-2">
            {i + 1}
          </Link>
        ))}
      </div>
    </div>
  );
}
