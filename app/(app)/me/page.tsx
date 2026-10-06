import type { Metadata } from "next";
import { Flag, Gem, Settings, ShieldCheck, Award } from "lucide-react";
import { requireSession, isMentor } from "@/lib/auth";
import { todayIn } from "@/lib/utils";
import { memberStats, syncDistinctions } from "@/lib/queries/me";
import { BADGES } from "@/lib/data/distinctions";
import { MEMORY_VERSES } from "@/lib/bible/memory-verses";
import { Avatar, Pill, RowLink, SectionTitle } from "@/components/ui/bits";
import { Card } from "@/components/ui/card";
import { SignOutButton } from "./sign-out-button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Me" };

export default async function MePage() {
  const { supabase, userId, profile, email } = await requireSession();
  const today = todayIn(profile.timezone);
  const stats = await memberStats(supabase, userId, today);
  const earned = await syncDistinctions(supabase, userId, stats);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <Avatar name={profile.display_name} src={profile.avatar_url} size={64} />
        <div className="min-w-0 flex-1">
          <h1 className="display text-[22px] font-semibold text-ink leading-tight truncate">{profile.display_name}</h1>
          <p className="text-sm text-ink-3 truncate">{email}</p>
          <div className="flex gap-1.5 mt-1.5"><Pill tone={profile.role === "member" ? "neutral" : "gold"} className="capitalize">{profile.role}</Pill>{profile.cohort && <Pill>Cohort {profile.cohort}</Pill>}</div>
        </div>
      </header>
      {profile.bio && <p className="text-[15px] text-ink-2 -mt-2">{profile.bio}</p>}

      <div className="grid grid-cols-3 gap-2">
        {[{ label: "Day streak", value: stats.currentStreak }, { label: "Verses", value: `${stats.versesMastered}/${MEMORY_VERSES.length}` }, { label: "Perfect days", value: stats.perfectDays }].map((s) => (
          <Card key={s.label} className="px-3 py-3 text-center"><p className="display text-2xl font-semibold text-ink tnum">{s.value}</p><p className="text-[11px] uppercase tracking-wider text-ink-3 font-semibold mt-0.5">{s.label}</p></Card>
        ))}
      </div>

      <section>
        <SectionTitle>Distinctions</SectionTitle>
        <ul className="grid grid-cols-2 gap-2">
          {BADGES.map((b) => {
            const on = earned.has(b.key);
            return (
              <li key={b.key} className={cn("rounded-card border px-3 py-3 flex gap-2.5", on ? "border-gold/60 bg-gold-soft" : "border-line bg-surface opacity-70")}>
                <Award className={cn("size-5 shrink-0 mt-0.5", on ? "text-gold-deep" : "text-ink-3")} aria-hidden />
                <div className="min-w-0"><p className="text-sm font-semibold text-ink leading-tight">{b.name}</p><p className="text-xs text-ink-3 mt-0.5">{on ? `Earned ${new Date(earned.get(b.key)!).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : b.how}</p></div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <SectionTitle>More</SectionTitle>
        <Card className="divide-y divide-line overflow-hidden">
          <RowLink href="/me/milestones" title="Milestones" meta="Life goals on a timeline" icon={<Flag className="size-[18px]" />} />
          <RowLink href="/me/vault" title="Vault" meta="KOD merch and unlocks" icon={<Gem className="size-[18px]" />} />
          {isMentor(profile) && <RowLink href="/me/mentor" title="Mentor tools" meta="Moderation, notes, members" icon={<ShieldCheck className="size-[18px]" />} />}
          <RowLink href="/me/settings" title="Settings" meta="Profile, time zone, password" icon={<Settings className="size-[18px]" />} />
        </Card>
      </section>
      <SignOutButton />
    </div>
  );
}
