"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { logFocusSession } from "@/lib/actions/screen-time";
import { FOCUS_LENGTHS, formatMinutes } from "@/lib/data/screen-time";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/form";
import { Card, CardBody } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Phase = { kind: "setup" } | { kind: "running"; endsAt: number } | { kind: "done"; steppedAway: number } | { kind: "ended" };

/**
 * A full-screen countdown. The browser can't stop other apps from opening, so this
 * counts how many times the member left the page and shows it honestly at the end.
 */
export function FocusSession({ today, verse }: { today: string; verse: { reference: string; text: string } | null }) {
  const [minutes, setMinutes] = useState<number>(25);
  const [intention, setIntention] = useState("");
  const [phase, setPhase] = useState<Phase>({ kind: "setup" });
  const [now, setNow] = useState(() => Date.now());
  const stepped = useRef(0);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  const releaseWakeLock = useCallback(() => { wakeLock.current?.release().catch(() => {}); wakeLock.current = null; }, []);

  const start = async () => {
    stepped.current = 0;
    setNow(Date.now());
    setPhase({ kind: "running", endsAt: Date.now() + minutes * 60_000 });
    try { wakeLock.current = await navigator.wakeLock?.request("screen") ?? null; } catch { /* unsupported or denied: fine */ }
  };

  // Tick from wall-clock time so a backgrounded tab still finishes on time.
  useEffect(() => {
    if (phase.kind !== "running") return;
    const id = setInterval(() => setNow(Date.now()), 500);
    const onVisibility = () => { if (document.visibilityState === "hidden") stepped.current += 1; };
    document.addEventListener("visibilitychange", onVisibility);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVisibility); };
  }, [phase.kind]);

  useEffect(() => {
    if (phase.kind === "running" && now >= phase.endsAt) {
      releaseWakeLock();
      setPhase({ kind: "done", steppedAway: stepped.current });
      logFocusSession(minutes, intention, stepped.current, today).catch(() => {});
    }
  }, [phase, now, minutes, intention, today, releaseWakeLock]);

  useEffect(() => releaseWakeLock, [releaseWakeLock]);

  if (phase.kind === "running") {
    const left = Math.max(0, Math.ceil((phase.endsAt - now) / 1000));
    const mm = String(Math.floor(left / 60)).padStart(2, "0");
    const ss = String(left % 60).padStart(2, "0");
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-navy px-6 text-center text-white" role="timer" aria-live="off">
        <p className="eyebrow !text-gold">Focus</p>
        {intention && <p className="max-w-[28ch] text-lg text-white/90">{intention}</p>}
        <p className="display text-7xl tnum tracking-wider">{mm}:{ss}</p>
        {verse && <blockquote className="max-w-[34ch] text-sm text-white/70" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>“{verse.text}” <cite className="not-italic text-gold block mt-1">{verse.reference}</cite></blockquote>}
        <Button variant="ghost" size="sm" className="text-white/60 hover:bg-white/10 hover:text-white" onClick={() => { releaseWakeLock(); setPhase({ kind: "ended" }); }}>End early</Button>
      </div>
    );
  }

  if (phase.kind === "done" || phase.kind === "ended") {
    const done = phase.kind === "done";
    return (
      <Card><CardBody className="flex flex-col items-center gap-3 py-8 text-center">
        {done && <span className="inline-flex size-12 items-center justify-center rounded-full bg-green text-on-green"><Check className="size-6" aria-hidden /></span>}
        <p className="display text-xl text-ink">{done ? `${formatMinutes(minutes)} of focus` : "Session ended early"}</p>
        <p className="text-sm text-ink-2 max-w-[32ch]">
          {done
            ? phase.steppedAway === 0 ? "You never left the screen. That's discipline." : `You stepped away ${phase.steppedAway} time${phase.steppedAway === 1 ? "" : "s"}. Next time, one fewer.`
            : "No shame in stopping. Try a shorter one and finish it."}
        </p>
        <div className="flex gap-2 mt-2">
          <Button variant="secondary" onClick={() => setPhase({ kind: "setup" })}>Another session</Button>
          <Link href="/growth/screen-time" className="inline-flex h-11 items-center px-4 text-[15px] font-semibold text-green">Done</Link>
        </div>
      </CardBody></Card>
    );
  }

  return (
    <Card><CardBody className="flex flex-col gap-4">
      <div>
        <Label>How long?</Label>
        <div className="grid grid-cols-4 gap-2">
          {FOCUS_LENGTHS.map((m) => (
            <button key={m} type="button" aria-pressed={minutes === m} onClick={() => setMinutes(m)} className={cn("h-11 rounded-xl border text-sm font-semibold tnum transition-colors", minutes === m ? "border-green bg-green-soft text-green" : "border-line text-ink-2 hover:text-ink")}>{m} min</button>
          ))}
        </div>
      </div>
      <div>
        <Label htmlFor="intention">What are you giving this time to?</Label>
        <Input id="intention" value={intention} onChange={(e) => setIntention(e.target.value)} maxLength={200} placeholder="Study for my exam, read Proverbs 3, pray…" />
      </div>
      <Button size="lg" onClick={start}>Start focus</Button>
      <p className="text-xs text-ink-3">Keep this page open. The screen stays awake, and KOD counts each time you leave it.</p>
    </CardBody></Card>
  );
}
