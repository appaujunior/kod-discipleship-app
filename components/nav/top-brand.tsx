"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";

/** Main tab screens. Sub-pages are left out because their back button owns the top-left. */
const BRANDED = ["/today", "/word", "/brothers", "/growth"];

/**
 * The crest at the top of each main tab, except Me, which leads with the member's own avatar.
 * The shield is paired with the wordmark: on its own at this size it reads as a stray icon.
 */
export function TopBrand() {
  const pathname = usePathname();
  if (!BRANDED.includes(pathname)) return null;
  return (
    <div className="flex items-center gap-2 pb-4">
      <Image src="/brand/kod-mark.svg" alt="" width={710} height={1523} className="h-11 w-auto" priority />
      <span className="display text-[15px] font-semibold tracking-[0.18em] text-gold-deep">KOD</span>
    </div>
  );
}
