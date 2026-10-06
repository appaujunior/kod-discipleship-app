"use client";

import { useOptimistic, useTransition } from "react";
import { Check } from "lucide-react";
import { setReadingDone } from "@/lib/actions/word";
import { Button } from "@/components/ui/button";

export function ReadingDoneButton({ slug, dayNumber, done, size = "md" }: { slug: string; dayNumber: number; done: boolean; size?: "sm" | "md" }) {
  const [isDone, setDone] = useOptimistic(done);
  const [pending, start] = useTransition();
  return (
    <Button
      variant={isDone ? "secondary" : "primary"}
      size={size}
      disabled={pending}
      onClick={() => start(async () => { setDone(!isDone); await setReadingDone(slug, dayNumber, !isDone); })}
      aria-pressed={isDone}
    >
      <Check className="size-4" aria-hidden />
      {isDone ? "Read" : "Mark as read"}
    </Button>
  );
}
