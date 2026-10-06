"use client";

import { useOptimistic, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { toggleSaved } from "@/lib/actions/word";
import { cn } from "@/lib/utils";

export function SaveButton({ kind, refValue, saved, dark = false }: { kind: "verse" | "video"; refValue: string; saved: boolean; dark?: boolean }) {
  const [isSaved, setSaved] = useOptimistic(saved);
  const [, start] = useTransition();
  return (
    <button
      type="button"
      aria-pressed={isSaved}
      aria-label={isSaved ? "Remove from saved" : "Save"}
      onClick={() => start(async () => { setSaved(!isSaved); await toggleSaved(kind, refValue); })}
      className={cn("inline-flex size-8 items-center justify-center rounded-full transition-colors", dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-ink-3 hover:bg-surface-2 hover:text-ink")}
    >
      <Bookmark className={cn("size-[18px]", isSaved && "fill-current text-gold")} />
    </button>
  );
}
