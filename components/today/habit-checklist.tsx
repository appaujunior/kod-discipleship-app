"use client";

import { useOptimistic, useTransition } from "react";
import { Check } from "lucide-react";
import { toggleHabit } from "@/lib/actions/habits";
import { PILLAR_BY_KEY } from "@/lib/data/pillars";
import type { Pillar } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export interface ChecklistHabit {
  id: string;
  title: string;
  detail: string | null;
  pillar: Pillar;
  done: boolean;
}

/** Tap-to-complete list. Updates instantly, then confirms with the server. */
export function HabitChecklist({ habits, date, compact = false }: { habits: ChecklistHabit[]; date: string; compact?: boolean }) {
  const [items, setOptimistic] = useOptimistic(habits, (state, id: string) =>
    state.map((h) => (h.id === id ? { ...h, done: !h.done } : h)),
  );
  const [, startTransition] = useTransition();

  const doneCount = items.filter((h) => h.done).length;

  function toggle(id: string) {
    startTransition(async () => {
      setOptimistic(id);
      await toggleHabit(id, date);
    });
  }

  return (
    <div>
      {!compact && (
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-sm text-ink-3 tnum">
            {doneCount} of {items.length} done
          </span>
        </div>
      )}
      <ul className="rounded-card border border-line bg-surface divide-y divide-line overflow-hidden">
        {items.map((h) => {
          const pillar = PILLAR_BY_KEY[h.pillar];
          return (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => toggle(h.id)}
                aria-pressed={h.done}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-2 transition-colors"
              >
                <span
                  className={cn(
                    "inline-flex size-6 items-center justify-center rounded-full border-2 transition-colors shrink-0",
                    h.done ? "border-green bg-green text-on-green" : "border-line-strong bg-transparent text-transparent",
                  )}
                  aria-hidden
                >
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-[15px] font-medium leading-tight", h.done ? "text-ink-3 line-through decoration-line-strong" : "text-ink")}>
                    {h.title}
                  </span>
                  {!compact && h.detail && <span className="block text-xs text-ink-3 mt-0.5 truncate">{h.detail}</span>}
                </span>
                <span className={cn("size-2 rounded-full shrink-0", pillar.dot)} title={pillar.name} aria-label={pillar.name} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
