import type { MemberStats } from "./merch";

export interface Badge {
  key: string;
  name: string;
  how: string;
  earned: (s: MemberStats & { posts: number; journalDays: number; goalsDone: number }) => boolean;
}

/** Badges are computed from activity; the distinctions table records when each was first earned. */
export const BADGES: Badge[] = [
  { key: "first-light", name: "First Light", how: "Complete every habit on one day", earned: (s) => s.perfectDays >= 1 },
  { key: "seven-days", name: "Seven Days", how: "A 7-day habit streak", earned: (s) => s.currentStreak >= 7 },
  { key: "thirty-days", name: "Thirty Days", how: "A 30-day habit streak", earned: (s) => s.currentStreak >= 30 },
  { key: "foundation", name: "Foundation", how: "Master the first ten verses", earned: (s) => s.versesMastered >= 10 },
  { key: "scribe", name: "Scribe", how: "Journal on ten different days", earned: (s) => s.journalDays >= 10 },
  { key: "keeper", name: "Brother's Keeper", how: "Post ten times in the feed", earned: (s) => s.posts >= 10 },
  { key: "finisher", name: "Finisher", how: "Complete a goal", earned: (s) => s.goalsDone >= 1 },
];
