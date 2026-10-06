"use client";

import { useOptimistic, useTransition } from "react";
import { Check } from "lucide-react";
import { toggleHabit, archiveHabit } from "@/lib/actions/habits";
import { PILLARS, PILLAR_BY_KEY } from "@/lib/data/pillars";
import type { Pillar } from "@/lib/supabase/types";
import { cn, parseDateOnly } from "@/lib/utils";

export interface WeekHabit {
  id: string;
  title: string;
  pillar: Pillar;
  target: number;
  done: string[];
}

/** Seven-day grid, grouped by pillar. Any day in the window can be toggled (catching up is allowed). */
export function HabitWeek({ habits, days, today }: { habits: WeekHabit[]; days: string[]; today: string }) {
  const [items, apply] = useOptimistic(habits, (state, action: { id: string; date: string }) =>
    state.map((h) => {
      if (h.id !== action.id) return h;
      const has = h.done.includes(action.date);
      return { ...h, done: has ? h.done.filter((d) => d !== action.date) : [...h.done, action.date] };
    }),
  );
  const [, start] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-[1fr_repeat(7,28px)] gap-x-1 px-1 text-[10px] font-semibold text-ink-3 uppercase tracking-wider">
        <span />
        {days.map((d) => (
          <span key={d} className={cn("text-center", d === today && "text-green")}>{parseDateOnly(d).toLocaleDateString("en-US", { weekday: "narrow" })}</span>
        ))}
      </div>
      {PILLARS.map((p) => {
        const rows = items.filter((h) => h.pillar === p.key);
        if (!rows.length) return null;
        return (
          <section key={p.key}>
            <h3 className="flex items-center gap-2 text-xs font-semibold text-ink-2 mb-1.5 px-1"><span className={cn("size-2 rounded-full", p.dot)} />{p.name}</h3>
            <ul className="rounded-card border border-line bg-surface divide-y divide-line">
              {rows.map((h) => {
                const weekCount = h.done.filter((d) => days.includes(d)).length;
                const met = weekCount >= h.target;
                return (
                  <li key={h.id} className="grid grid-cols-[1fr_repeat(7,28px)] gap-x-1 items-center px-2 py-1.5">
                    <div className="min-w-0 pl-1 pr-2 flex items-center gap-1.5">
                      <button type="button" onDoubleClick={() => { if (confirm(`Archive "${h.title}"? Its history stays.`)) start(() => archiveHabit(h.id)); }} className="min-w-0 text-left" title="Double-tap to archive">
                        <span className="block text-[13px] font-medium text-ink truncate leading-tight">{h.title}</span>
                        <span className={cn("block text-[11px] tnum", met ? "text-green" : "text-ink-3")}>{weekCount}/{h.target} this week</span>
                      </button>
                    </div>
                    {days.map((d) => {
                      const on = h.done.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          aria-label={`${h.title}, ${d}`}
                          aria-pressed={on}
                          onClick={() => start(async () => { apply({ id: h.id, date: d }); await toggleHabit(h.id, d); })}
                          className={cn(
                            "size-7 rounded-md border grid place-items-center transition-colors",
                            on ? "bg-green border-green text-on-green" : d === today ? "border-line-strong bg-surface hover:bg-surface-2" : "border-line bg-surface-2/60 hover:bg-surface-2",
                          )}
                        >
                          {on && <Check className="size-3.5" strokeWidth={3} aria-hidden />}
                        </button>
                      );
                    })}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      <p className="text-xs text-ink-3 px-1">Tip: double-tap a habit name to archive it. {PILLAR_BY_KEY.growth.tagline}</p>
    </div>
  );
}
