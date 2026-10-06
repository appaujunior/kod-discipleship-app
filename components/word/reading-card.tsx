import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/bits";
import { formatPassage, readerHref } from "@/lib/bible/refs";
import type { NextReading } from "@/lib/queries/word";
import { ReadingDoneButton } from "./reading-done-button";

export function ReadingCard({ reading }: { reading: NextReading }) {
  const { plan, dayNumber, label, passages, completed, finished } = reading;
  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/word/plans/${plan.slug}`} className="eyebrow hover:underline">{plan.title}</Link>
            <p className="font-semibold text-ink mt-0.5">{finished ? "Plan complete" : label}</p>
          </div>
          <span className="text-sm text-ink-3 tnum shrink-0">{completed}/{plan.days}</span>
        </div>
        <ProgressBar value={completed} max={plan.days} />
        {!finished && (
          <>
            <ul className="flex flex-col divide-y divide-line -mx-4">
              {passages.map((p) => (
                <li key={formatPassage(p)}>
                  <Link href={readerHref(p)} className="flex items-center justify-between px-4 py-2.5 text-[15px] text-ink hover:bg-surface-2">
                    <span>{formatPassage(p)}</span>
                    <ChevronRight className="size-4 text-ink-3" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <ReadingDoneButton slug={plan.slug} dayNumber={dayNumber} done={false} />
          </>
        )}
      </CardBody>
    </Card>
  );
}
