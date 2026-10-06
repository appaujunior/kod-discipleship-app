import type { Metadata } from "next";
import { requireSession, isMentor } from "@/lib/auth";
import { todayIn, parseDateOnly } from "@/lib/utils";
import { EmptyState, SectionTitle, Avatar } from "@/components/ui/bits";
import { Card, CardBody } from "@/components/ui/card";
import { NewChallengeForm, ChallengeButtons } from "./challenge-forms";

export const metadata: Metadata = { title: "Challenges" };

export default async function ChallengesPage() {
  const { supabase, userId, profile } = await requireSession();
  const today = todayIn(profile.timezone);
  const [{ data: challenges }, { data: members }, { data: checkins }, { data: people }] = await Promise.all([
    supabase.from("challenges").select("*").gte("ends_on", today).order("starts_on"),
    supabase.from("challenge_members").select("challenge_id, user_id"),
    supabase.from("challenge_checkins").select("challenge_id, user_id, checkin_date"),
    supabase.from("profiles").select("id, display_name, avatar_url"),
  ]);
  const nameOf = new Map((people ?? []).map((p) => [p.id, p]));

  return (
    <div className="flex flex-col gap-5">
      <NewChallengeForm today={today} />
      {!challenges?.length ? (
        <EmptyState title="No live challenges" body="Start one: 7 days of morning prayer, 30 days no skipped workouts. Brothers check in daily and the board keeps score." />
      ) : (
        challenges.map((c) => {
          const roster = (members ?? []).filter((m) => m.challenge_id === c.id).map((m) => m.user_id);
          const joined = roster.includes(userId);
          const mine = (checkins ?? []).some((k) => k.challenge_id === c.id && k.user_id === userId && k.checkin_date === today);
          const board = roster
            .map((uid) => ({ uid, name: nameOf.get(uid)?.display_name ?? "Member", avatar: nameOf.get(uid)?.avatar_url ?? null, score: (checkins ?? []).filter((k) => k.challenge_id === c.id && k.user_id === uid).length }))
            .sort((a, b) => b.score - a.score);
          const started = c.starts_on <= today;
          const totalDays = Math.round((parseDateOnly(c.ends_on).getTime() - parseDateOnly(c.starts_on).getTime()) / 86_400_000) + 1;
          return (
            <Card key={c.id}>
              <CardBody className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink leading-tight">{c.title}</p>
                    <p className="text-xs text-ink-3 mt-0.5">{parseDateOnly(c.starts_on).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {parseDateOnly(c.ends_on).toLocaleDateString("en-US", { month: "short", day: "numeric" })} · {totalDays} days · {roster.length} in</p>
                  </div>
                  <ChallengeButtons id={c.id} joined={joined} checkedIn={mine} today={today} started={started} canDelete={c.creator_id === userId || isMentor(profile)} />
                </div>
                {c.description && <p className="text-sm text-ink-2">{c.description}</p>}
                {board.length > 0 && (
                  <div>
                    <SectionTitle className="mb-1.5">Board</SectionTitle>
                    <ol className="flex flex-col divide-y divide-line -mx-4">
                      {board.map((b, i) => (
                        <li key={b.uid} className="flex items-center gap-3 px-4 py-2 text-sm"><span className="w-4 text-ink-3 tnum">{i + 1}</span><Avatar name={b.name} src={b.avatar} size={28} /><span className="flex-1 text-ink truncate">{b.name}{b.uid === userId && <span className="text-ink-3"> (you)</span>}</span><span className="tnum font-semibold text-ink">{b.score}<span className="text-ink-3 font-normal">/{totalDays}</span></span></li>
                      ))}
                    </ol>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })
      )}
    </div>
  );
}
