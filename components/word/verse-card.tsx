import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { parseRef, readerHref } from "@/lib/bible/refs";
import { SaveButton } from "./save-button";
import { ShareVerseButton } from "./share-verse-button";

/** Verse of the day, or any single reference with its text. */
export function VerseCard({ reference, text, saved, eyebrow = "Word for today" }: { reference: string; text: string; saved: boolean; eyebrow?: string }) {
  const passage = parseRef(reference);
  return (
    <Card className="bg-navy border-navy text-white">
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="eyebrow !text-gold">{eyebrow}</span>
          <span className="flex items-center"><ShareVerseButton reference={reference} text={text} dark /><SaveButton kind="verse" refValue={reference} saved={saved} dark /></span>
        </div>
        <blockquote className="font-serif text-[19px] leading-relaxed text-white/95" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
          “{text}”
        </blockquote>
        <div className="flex items-center justify-between">
          <cite className="not-italic display text-sm text-gold">{reference}</cite>
          {passage && (
            <Link href={readerHref(passage)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white">
              <BookOpen className="size-4" aria-hidden /> Read chapter
            </Link>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
