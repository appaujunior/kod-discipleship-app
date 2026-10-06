import { allChapters, type BibleBook } from "./books";
import type { Passage } from "./refs";

export interface ReadingPlan {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  /** Total readings in the plan. */
  days: number;
  /** Readings per week (7 = every day, 5 = weekdays with weekends free). */
  perWeek: 5 | 7;
}

export const PLANS: ReadingPlan[] = [
  {
    slug: "bible-in-a-year",
    title: "Bible in a Year",
    tagline: "Genesis to Revelation, 365 days",
    description: "About three chapters a day in canonical order. Miss a day and just pick up where you left off; the plan tracks readings, not dates.",
    days: 365,
    perWeek: 7,
  },
  {
    slug: "five-day",
    title: "5-Day Plan",
    tagline: "Weekdays on, weekends free, one year",
    description: "Five readings a week for 52 weeks, about four and a half chapters each. Built for men who want a rhythm with room to breathe.",
    days: 260,
    perWeek: 5,
  },
];

export function planBySlug(slug: string): ReadingPlan | undefined {
  return PLANS.find((p) => p.slug === slug);
}

/** Group a run of consecutive chapters into passages, splitting at book boundaries. */
function groupChapters(run: { book: BibleBook; chapter: number }[]): Passage[] {
  const out: Passage[] = [];
  for (const { book, chapter } of run) {
    const last = out[out.length - 1];
    if (last && last.book.slug === book.slug && last.chapterEnd === chapter - 1) {
      last.chapterEnd = chapter;
    } else {
      out.push({ book, chapterStart: chapter, chapterEnd: chapter });
    }
  }
  return out;
}

const cache = new Map<string, Passage[][]>();

/** Passages for every reading in a plan, index 0 = day 1. Chapters are spread evenly in canonical order. */
export function planSchedule(plan: ReadingPlan): Passage[][] {
  const hit = cache.get(plan.slug);
  if (hit) return hit;
  const chapters = allChapters();
  const total = chapters.length;
  const schedule: Passage[][] = [];
  for (let d = 0; d < plan.days; d++) {
    const from = Math.floor((d * total) / plan.days);
    const to = Math.floor(((d + 1) * total) / plan.days);
    schedule.push(groupChapters(chapters.slice(from, to)));
  }
  cache.set(plan.slug, schedule);
  return schedule;
}

export function planDay(plan: ReadingPlan, dayNumber: number): Passage[] {
  return planSchedule(plan)[dayNumber - 1] ?? [];
}

/** Human label for a reading: "Day 12" or "Week 3 · Day 2". */
export function dayLabel(plan: ReadingPlan, dayNumber: number): string {
  if (plan.perWeek === 7) return `Day ${dayNumber}`;
  const week = Math.floor((dayNumber - 1) / 5) + 1;
  const day = ((dayNumber - 1) % 5) + 1;
  return `Week ${week} · Day ${day}`;
}
