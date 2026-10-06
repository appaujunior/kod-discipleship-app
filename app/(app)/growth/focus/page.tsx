import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { todayIn } from "@/lib/utils";
import { verseOfTheDay } from "@/lib/bible/daily-verses";
import { verseText } from "@/lib/bible/kjv.server";
import { PageHeader } from "@/components/ui/bits";
import { FocusSession } from "./focus-session";

export const metadata: Metadata = { title: "Focus" };

export default async function FocusPage() {
  const { profile } = await requireSession();
  const today = todayIn(profile.timezone);
  const reference = verseOfTheDay(today);
  const text = await verseText(reference);
  return (
    <div className="flex flex-col gap-2">
      <PageHeader back="/growth/screen-time" eyebrow="One thing at a time" title="Focus session" />
      <FocusSession today={today} verse={text ? { reference, text } : null} />
    </div>
  );
}
