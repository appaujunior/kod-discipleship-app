"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { reviewVerse } from "@/lib/actions/word";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

/** Hide-and-recite practice. First letters stay visible as a prompt. */
export function VersePractice({ verseId, text, reviewCount, mastered }: { verseId: number; text: string; reviewCount: number; mastered: boolean }) {
  const [hidden, setHidden] = useState(false);
  const [pending, start] = useTransition();
  const prompt = text.split(" ").map((w) => w.replace(/^(\W*\w)(.*)$/, (_, a: string, b: string) => a + "_".repeat(Math.min(b.length, 6)))).join(" ");

  return (
    <Card>
      <CardBody className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-ink">Practice</p>
          <Button variant="ghost" size="sm" onClick={() => setHidden((h) => !h)}>
            {hidden ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
            {hidden ? "Show verse" : "Hide verse"}
          </Button>
        </div>
        <p className="text-[15px] leading-relaxed text-ink-2 font-mono text-sm whitespace-pre-wrap">{hidden ? prompt : "Read it aloud three times. Then hide it and say it from the first letters."}</p>
        <div className="flex gap-2">
          <Button className="flex-1" disabled={pending || mastered} onClick={() => start(() => reviewVerse(verseId))}>
            <Check className="size-4" aria-hidden /> {mastered ? "Mastered" : `I said it (${reviewCount}/3)`}
          </Button>
          {!mastered && reviewCount >= 1 && (
            <Button variant="gold" disabled={pending} onClick={() => start(() => reviewVerse(verseId, true))}>Mark mastered</Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
