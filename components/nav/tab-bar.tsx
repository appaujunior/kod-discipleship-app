"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, BookOpen, Users, TrendingUp, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/today", label: "Today", icon: Sun },
  { href: "/word", label: "Word", icon: BookOpen },
  { href: "/brothers", label: "Brothers", icon: Users },
  { href: "/growth", label: "Growth", icon: TrendingUp },
  { href: "/me", label: "Me", icon: Crown },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur pb-safe">
      <ul className="mx-auto flex max-w-lg">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition-colors",
                  active ? "text-green" : "text-ink-3 hover:text-ink-2",
                )}
              >
                <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 1.9} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
