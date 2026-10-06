import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { requireSession, isMentor } from "@/lib/auth";
import { PageHeader, Pill, EmptyState } from "@/components/ui/bits";
import { AddVideoForm } from "./add-video-form";

export const metadata: Metadata = { title: "Videos" };

export default async function VideosPage() {
  const { supabase, profile } = await requireSession();
  const { data: videos } = await supabase.from("videos").select("*").order("featured", { ascending: false }).order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader back="/word" eyebrow="Teaching" title="Videos" />
      {isMentor(profile) && <AddVideoForm />}
      {!videos?.length ? (
        <EmptyState title="No videos yet" body="Mentors can add YouTube links to build the library." />
      ) : (
        <ul className="grid grid-cols-1 gap-3">
          {videos.map((v) => (
            <li key={v.id}>
              <Link href={`/word/videos/${v.id}`} className="group flex gap-3 rounded-card border border-line bg-surface p-2.5 hover:bg-surface-2">
                <span className="relative w-32 aspect-video rounded-lg overflow-hidden bg-navy shrink-0">
                  <Image src={`https://i.ytimg.com/vi/${v.youtube_id}/mqdefault.jpg`} alt="" fill sizes="128px" className="object-cover" />
                  <span className="absolute inset-0 grid place-items-center"><Play className="size-6 text-white drop-shadow" aria-hidden /></span>
                </span>
                <span className="min-w-0 flex flex-col gap-1 py-0.5">
                  <span className="font-semibold text-ink leading-snug line-clamp-2">{v.title}</span>
                  <span className="text-sm text-ink-3 truncate">{v.channel}</span>
                  <span className="flex gap-1.5 mt-auto">{v.featured && <Pill tone="gold">Featured</Pill>}{v.topic && <Pill>{v.topic}</Pill>}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
