import { MEMORY_VERSES } from "./memory-verses";

/** Extra references rotated through verse-of-the-day alongside the memory track. */
const EXTRA: string[] = [
  "Lamentations 3:22-23", "Psalms 118:24", "Psalms 90:12", "Proverbs 3:9-10", "Isaiah 26:3", "John 14:27",
  "John 16:33", "Romans 5:8", "Romans 15:13", "1 Corinthians 13:4-7", "2 Corinthians 12:9", "Philippians 4:6-7",
  "Philippians 1:6", "Colossians 3:2", "1 Thessalonians 5:16-18", "Hebrews 11:1", "Hebrews 12:1-2", "James 4:7-8",
  "1 John 4:18-19", "Psalms 37:4-5", "Psalms 51:10", "Psalms 139:14", "Psalms 143:8", "Proverbs 18:24",
  "Proverbs 20:7", "Proverbs 24:16", "Isaiah 43:2", "Isaiah 55:8-9", "Matthew 11:28-30", "Matthew 7:7",
  "Luke 6:31", "John 8:32", "John 13:34-35", "Romans 8:1", "1 Corinthians 15:58", "Ephesians 4:32",
  "Ephesians 5:15-16", "1 Timothy 6:12", "2 Timothy 2:15", "Titus 2:6-7", "1 Peter 2:9", "Psalms 16:11",
  "Psalms 32:8", "Psalms 40:1-2", "Psalms 121:1-2", "Deuteronomy 31:6", "Nehemiah 8:10", "Zephaniah 3:17",
  "Malachi 4:6", "Luke 12:48",
];

const ALL = [...MEMORY_VERSES.map((v) => v.ref), ...EXTRA];

/** Deterministic verse reference for a calendar date (YYYY-MM-DD), same for every member that day. */
export function verseOfTheDay(dateIso: string): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  const start = Date.UTC(y, 0, 1);
  const day = Math.floor((Date.UTC(y, m - 1, d) - start) / 86_400_000);
  // Offset by year so the rotation shifts annually.
  return ALL[(day + y * 7) % ALL.length]!;
}
