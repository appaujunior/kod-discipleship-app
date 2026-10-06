"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export interface SegmentItem {
  label: string;
  href: string;
}

/** Sub-navigation under a tab, driven by the URL so it survives refresh and back. */
export function Segmented({ items, className }: { items: SegmentItem[]; className?: string }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const current = search.size ? `${pathname}?${search.toString()}` : pathname;
  return (
    <nav className={cn("flex gap-1 rounded-xl bg-surface-2 p-1 overflow-x-auto", className)} aria-label="Section">
      {items.map((it) => {
        const active = current === it.href || (!it.href.includes("?") && pathname === it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex-1 min-w-fit rounded-lg px-3 py-1.5 text-center text-sm font-semibold transition-colors",
              active ? "bg-surface text-ink shadow-card" : "text-ink-3 hover:text-ink",
            )}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
