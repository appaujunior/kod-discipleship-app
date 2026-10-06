/** The three guided questions asked every evening, in order. `key` is the journal_entries column. */
export const JOURNAL_PROMPTS = [
  { key: "grateful", question: "What made you grateful today?", placeholder: "A person, a moment, something God provided…" },
  { key: "proud", question: "What are you proud of today?", placeholder: "Something you did right, even if it was small" },
  { key: "kingdom", question: "How did you advance the Kingdom today?", placeholder: "Served someone, shared the Word, chose right when it cost you…" },
] as const;

export type JournalPromptKey = (typeof JOURNAL_PROMPTS)[number]["key"];

/**
 * Consecutive days, ending today or yesterday, with at least one journal entry.
 * `dates` are YYYY-MM-DD strings; duplicates are fine.
 */
export function journalStreak(dates: string[], today: string): number {
  const have = new Set(dates);
  const step = (iso: string) => {
    const d = new Date(`${iso}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toISOString().slice(0, 10);
  };
  let day = have.has(today) ? today : step(today);
  let n = 0;
  while (have.has(day)) { n += 1; day = step(day); }
  return n;
}
