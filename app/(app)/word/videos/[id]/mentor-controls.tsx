"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setFeaturedVideo, removeVideo } from "@/lib/actions/word";
import { Button } from "@/components/ui/button";

export function MentorVideoControls({ videoId, featured }: { videoId: string; featured: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="flex items-center gap-2 rounded-card border border-gold/40 bg-gold-soft px-4 py-3">
      <span className="eyebrow flex-1">Mentor tools</span>
      <Button size="sm" variant="gold" disabled={pending || featured} onClick={() => start(() => setFeaturedVideo(videoId))}>{featured ? "Featured" : "Feature on Today"}</Button>
      <Button size="sm" variant="danger" disabled={pending} onClick={() => { if (confirm("Remove this video from the library?")) start(async () => { await removeVideo(videoId); router.push("/word/videos"); }); }}>Remove</Button>
    </div>
  );
}
