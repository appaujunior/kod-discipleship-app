"use client";

import { useState, useTransition } from "react";
import { Check, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { logWorkout, deleteWorkoutLog, deleteCustomWorkout } from "@/lib/actions/body-finance";
import { Button } from "@/components/ui/button";

export function LogWorkoutButton({ slug, today }: { slug: string; today: string }) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  return (
    <Button size="lg" variant={done ? "secondary" : "primary"} disabled={pending || done} onClick={() => start(async () => { await logWorkout(slug, today); setDone(true); })}>
      <Check className="size-4" aria-hidden /> {done ? "Logged for today" : "Log this workout"}
    </Button>
  );
}

export function DeleteLogButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return <button type="button" aria-label="Delete" disabled={pending} onClick={() => start(() => deleteWorkoutLog(id))} className="text-ink-3 hover:text-danger"><Trash2 className="size-4" /></button>;
}

export function DeleteWorkoutButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Button variant="ghost" size="sm" className="self-center text-ink-3" disabled={pending} onClick={() => {
      if (!confirm("Delete this workout? Your training log keeps its history.")) return;
      start(async () => { await deleteCustomWorkout(id); router.push("/growth/body"); });
    }}>
      <Trash2 className="size-4" aria-hidden /> Delete workout
    </Button>
  );
}
