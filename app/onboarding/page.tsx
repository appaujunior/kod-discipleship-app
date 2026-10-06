import type { Metadata } from "next";
import Image from "next/image";
import { requireSession } from "@/lib/auth";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Set up" };

export default async function OnboardingPage() {
  const { profile } = await requireSession({ allowUnonboarded: true });
  return (
    <div className="flex-1 flex flex-col items-center px-5 pt-safe">
      <div className="w-full max-w-sm flex flex-col items-center pt-10 pb-12">
        <Image src="/brand/kod-mark.svg" alt="" width={56} height={128} priority className="h-20 w-auto" />
        <p className="eyebrow mt-4">Welcome, King</p>
        <OnboardingForm defaultName={profile.display_name} defaultCohort={profile.cohort ?? ""} />
      </div>
    </div>
  );
}
