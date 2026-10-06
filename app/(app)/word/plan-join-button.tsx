"use client";

import { useTransition } from "react";
import { startPlan, leavePlan } from "@/lib/actions/word";
import { Button } from "@/components/ui/button";

export function PlanJoinButton({ slug, joined = false }: { slug: string; joined?: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Button size="sm" variant={joined ? "outline" : "primary"} disabled={pending} onClick={() => start(() => (joined ? leavePlan(slug) : startPlan(slug)))}>
      {joined ? "Leave plan" : "Start"}
    </Button>
  );
}
