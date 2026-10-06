export interface MerchItem {
  slug: string;
  title: string;
  price: number;
  category: string;
}

export interface MerchUnlock {
  code: string;
  discount: string;
  requirement: string;
  /** Returns progress 0..target given the member's stats. */
  progress: (s: MemberStats) => { current: number; target: number };
}

export interface MemberStats {
  habitCompletions: number;
  perfectDays: number;
  versesMastered: number;
  currentStreak: number;
}

/** Carried over from the prototype's vault. Prices are placeholders until the store is connected. */
export const MERCH: MerchItem[] = [
  { slug: "dont-give-up-jacket", title: "Don't Give Up Jacket", price: 120, category: "Outerwear" },
  { slug: "kod-beanie-green", title: "KOD Beanie", price: 30, category: "Headwear" },
  { slug: "kod-beanie-navy", title: "KOD Beanie, navy", price: 35, category: "Headwear" },
];

export const UNLOCKS: MerchUnlock[] = [
  { code: "KOD_DISTINCTION_25", discount: "25% off", requirement: "10 perfect habit days", progress: (s) => ({ current: Math.min(s.perfectDays, 10), target: 10 }) },
  { code: "KOD_ELITE_50", discount: "50% off", requirement: "Master all 50 memory verses", progress: (s) => ({ current: s.versesMastered, target: 50 }) },
];

export const STORE_URL = "https://kingsofdistinction.com";
