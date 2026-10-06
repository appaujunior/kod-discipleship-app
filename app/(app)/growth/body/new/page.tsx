import type { Metadata } from "next";
import { requireSession, isMentor } from "@/lib/auth";
import { PageHeader } from "@/components/ui/bits";
import { WorkoutBuilder } from "./workout-builder";

export const metadata: Metadata = { title: "Build a workout" };

export default async function NewWorkoutPage() {
  const { profile } = await requireSession();
  return (
    <div className="flex flex-col gap-2">
      <PageHeader back="/growth/body" eyebrow="Your own plan" title="Build a workout" />
      <WorkoutBuilder canShare={isMentor(profile)} />
    </div>
  );
}
