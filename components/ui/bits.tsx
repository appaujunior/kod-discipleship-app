import * as React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn, initials } from "@/lib/utils";

export function Pill({ className, tone = "neutral", ...props }: React.HTMLAttributes<HTMLSpanElement> & { tone?: "neutral" | "green" | "navy" | "gold" | "danger" }) {
  const tones = {
    neutral: "bg-surface-2 text-ink-2",
    green: "bg-green-soft text-green",
    navy: "bg-navy-soft text-navy",
    gold: "bg-gold-soft text-gold-deep",
    danger: "bg-danger-soft text-danger",
  };
  return <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold", tones[tone], className)} {...props} />;
}

export function Avatar({ name, src, size = 36, className }: { name: string; src?: string | null; size?: number; className?: string }) {
  const style = { width: size, height: size, fontSize: Math.max(11, size * 0.38) };
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} style={style} className={cn("rounded-full object-cover shrink-0", className)} />;
  }
  return (
    <span style={style} className={cn("inline-flex items-center justify-center rounded-full bg-navy text-white font-semibold shrink-0 display", className)} aria-hidden>
      {initials(name)}
    </span>
  );
}

/** Screen title block. `back` renders a chevron link; `action` sits on the right. */
export function PageHeader({ title, eyebrow, back, action, children }: { title: string; eyebrow?: string; back?: string; action?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-1 mb-5">
      <div className="flex items-center justify-between gap-3 min-h-10">
        <div className="flex items-center gap-2 min-w-0">
          {back && (
            <Link href={back} aria-label="Back" className="-ml-2 inline-flex size-9 items-center justify-center rounded-full text-ink-2 hover:bg-surface-2">
              <ChevronLeft className="size-5" />
            </Link>
          )}
          <div className="min-w-0">
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            <h1 className="display text-[22px] font-semibold text-ink leading-tight truncate">{title}</h1>
          </div>
        </div>
        {action}
      </div>
      {children}
    </header>
  );
}

export function SectionTitle({ children, action, className }: { children: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 mb-2.5", className)}>
      <h2 className="eyebrow">{children}</h2>
      {action}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-card border border-dashed border-line-strong px-5 py-8 text-center">
      <p className="font-semibold text-ink">{title}</p>
      {body && <p className="text-sm text-ink-3 mt-1 max-w-[36ch] mx-auto">{body}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, max, tone = "green", className }: { value: number; max: number; tone?: "green" | "gold" | "navy"; className?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const fill = { green: "bg-green", gold: "bg-gold", navy: "bg-navy" }[tone];
  return (
    <div className={cn("h-1.5 w-full rounded-full bg-surface-2 overflow-hidden", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className={cn("h-full rounded-full transition-[width]", fill)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Row link with a chevron, for module lists. */
export function RowLink({ href, title, meta, icon, right }: { href: string; title: string; meta?: string; icon?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-surface-2 transition-colors">
      {icon && <span className="inline-flex size-9 items-center justify-center rounded-lg bg-surface-2 text-ink-2 shrink-0">{icon}</span>}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink truncate">{title}</span>
        {meta && <span className="block text-sm text-ink-3 truncate">{meta}</span>}
      </span>
      {right ?? <span className="text-ink-3">›</span>}
    </Link>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}
