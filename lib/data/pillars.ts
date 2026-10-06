import type { Pillar } from "@/lib/supabase/types";

export interface PillarMeta {
  key: Pillar;
  name: string;
  crest: string;
  tagline: string;
  /** Tailwind classes for the pillar's chip. */
  chip: string;
  dot: string;
}

/** The four quarters of the KOD crest, in shield order. */
export const PILLARS: PillarMeta[] = [
  { key: "word", name: "Word", crest: "Book & torch", tagline: "Scripture in, daily.", chip: "bg-green-soft text-green", dot: "bg-green" },
  { key: "prayer", name: "Prayer", crest: "Praying hands", tagline: "Talk to God, keep the record.", chip: "bg-navy-soft text-navy", dot: "bg-navy" },
  { key: "brotherhood", name: "Brotherhood", crest: "Handshake", tagline: "Honest, together.", chip: "bg-navy-soft text-navy", dot: "bg-navy" },
  { key: "growth", name: "Growth", crest: "Rising chart", tagline: "Plan it, track it, reach it.", chip: "bg-green-soft text-green", dot: "bg-green" },
];

export const PILLAR_BY_KEY = Object.fromEntries(PILLARS.map((p) => [p.key, p])) as Record<Pillar, PillarMeta>;
