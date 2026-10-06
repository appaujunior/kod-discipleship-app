import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import { PageHeader, SectionTitle, EmptyState } from "@/components/ui/bits";
import { PrayerForm, PrayerRow } from "./prayer-form";

export const metadata: Metadata = { title: "Prayer" };

export default async function PrayerPage() {
  const { supabase, userId } = await requireSession();
  const { data: prayers } = await supabase.from("prayers").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  const open = (prayers ?? []).filter((p) => !p.answered_at);
  const answered = (prayers ?? []).filter((p) => p.answered_at);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader back="/growth" eyebrow="Praying hands" title="Prayer list" />
      <PrayerForm />
      <section>
        <SectionTitle>Carrying</SectionTitle>
        {open.length === 0 ? <EmptyState title="Nothing on the list" body="Write down what you're asking God for. Then you'll see when He answers." /> : (
          <ul className="rounded-card border border-line bg-surface divide-y divide-line">{open.map((p) => <PrayerRow key={p.id} prayer={p} />)}</ul>
        )}
      </section>
      {answered.length > 0 && (
        <section>
          <SectionTitle>Answered</SectionTitle>
          <ul className="rounded-card border border-line bg-surface divide-y divide-line">{answered.map((p) => <PrayerRow key={p.id} prayer={p} />)}</ul>
        </section>
      )}
    </div>
  );
}
