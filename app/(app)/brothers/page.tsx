import type { Metadata } from "next";
import Link from "next/link";
import { requireSession, isMentor } from "@/lib/auth";
import { feed, POST_KINDS } from "@/lib/queries/brothers";
import type { PostKind } from "@/lib/supabase/types";
import { Composer } from "@/components/brothers/composer";
import { PostCard } from "@/components/brothers/post-card";
import { EmptyState } from "@/components/ui/bits";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Brothers" };

export default async function FeedPage(props: PageProps<"/brothers">) {
  const sp = await props.searchParams;
  const kind = POST_KINDS.some((k) => k.key === sp.kind) ? (sp.kind as PostKind) : undefined;
  const { supabase, userId, profile } = await requireSession();
  const posts = await feed(supabase, userId, kind);

  return (
    <div className="flex flex-col gap-4">
      <Composer name={profile.display_name} avatar={profile.avatar_url} />
      <div className="flex gap-1.5 overflow-x-auto -mx-4 px-4 pb-0.5">
        <Link href="/brothers" className={cn("rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap", !kind ? "border-ink bg-ink text-bg" : "border-line text-ink-3")}>All</Link>
        {POST_KINDS.map((k) => (
          <Link key={k.key} href={`/brothers?kind=${k.key}`} className={cn("rounded-full border px-3 py-1 text-xs font-semibold whitespace-nowrap", kind === k.key ? "border-ink bg-ink text-bg" : "border-line text-ink-3")}>{k.label}</Link>
        ))}
      </div>
      {posts.length === 0 ? (
        <EmptyState title="Quiet in here" body="Be the first. An honest check-in gives every other brother permission to be honest too." />
      ) : (
        <div className="flex flex-col gap-3">{posts.map((p) => <PostCard key={p.id} post={p} viewerId={userId} viewerIsMentor={isMentor(profile)} />)}</div>
      )}
    </div>
  );
}
