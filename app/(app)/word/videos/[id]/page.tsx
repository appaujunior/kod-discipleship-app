import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSession, isMentor } from "@/lib/auth";
import { PageHeader, Pill } from "@/components/ui/bits";
import { SaveButton } from "@/components/word/save-button";
import { MentorVideoControls } from "./mentor-controls";

export async function generateMetadata(props: PageProps<"/word/videos/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const { supabase } = await requireSession();
  const { data } = await supabase.from("videos").select("title").eq("id", id).maybeSingle();
  return { title: data?.title ?? "Video" };
}

export default async function VideoPage(props: PageProps<"/word/videos/[id]">) {
  const { id } = await props.params;
  const { supabase, userId, profile } = await requireSession();
  const [{ data: video }, { data: saved }] = await Promise.all([
    supabase.from("videos").select("*").eq("id", id).maybeSingle(),
    supabase.from("saved_items").select("id").eq("user_id", userId).eq("kind", "video").eq("ref", id).maybeSingle(),
  ]);
  if (!video) notFound();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader back="/word/videos" eyebrow={video.channel ?? "Teaching"} title={video.title} action={<SaveButton kind="video" refValue={video.id} saved={!!saved} />} />
      <div className="aspect-video w-full overflow-hidden rounded-card bg-navy">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}?rel=0&modestbranding=1`}
          title={video.title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <div className="flex gap-1.5">{video.featured && <Pill tone="gold">Featured this week</Pill>}{video.topic && <Pill>{video.topic}</Pill>}</div>
      {isMentor(profile) && <MentorVideoControls videoId={video.id} featured={video.featured} />}
    </div>
  );
}
