import { formatMinutes } from "@/lib/data/screen-time";
import { parseDateOnly } from "@/lib/utils";

/**
 * Daily screen time as single-hue bars with the member's goal as a dashed reference line.
 * One series, so no legend; each bar carries a native tooltip and the data is repeated
 * in a visually hidden table for screen readers.
 */
export function ScreenTimeChart({ days, goal }: { days: { date: string; minutes: number | null }[]; goal: number }) {
  const max = Math.max(goal * 1.25, ...days.map((d) => d.minutes ?? 0), 60);
  const goalPct = (goal / max) * 100;
  const label = (iso: string) => parseDateOnly(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return (
    <figure className="rounded-card border border-line bg-surface px-4 pt-4 pb-3">
      <div className="relative h-36" aria-hidden>
        <div className="absolute inset-x-0 border-t border-dashed border-ink-3" style={{ bottom: `${goalPct}%` }}>
          <span className="absolute right-0 -top-5 text-[11px] font-semibold text-ink-3">Goal {formatMinutes(goal)}</span>
        </div>
        <div className="absolute inset-0 flex items-end gap-[2px] border-b border-line">
          {days.map((d) => (
            <div key={d.date} className="group relative flex-1 h-full flex items-end" title={`${label(d.date)}: ${d.minutes == null ? "not logged" : formatMinutes(d.minutes)}`}>
              {d.minutes != null && (
                <div className="w-full rounded-t-[4px] bg-green group-hover:bg-green-strong transition-colors" style={{ height: `${Math.max(1.5, (d.minutes / max) * 100)}%` }} />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-1.5 text-[11px] text-ink-3" aria-hidden>
        <span>{label(days[0]!.date)}</span><span>Today</span>
      </div>
      <table className="sr-only">
        <caption>Daily screen time, last {days.length} days, goal {formatMinutes(goal)}</caption>
        <tbody>{days.map((d) => <tr key={d.date}><th scope="row">{label(d.date)}</th><td>{d.minutes == null ? "Not logged" : formatMinutes(d.minutes)}</td></tr>)}</tbody>
      </table>
    </figure>
  );
}
