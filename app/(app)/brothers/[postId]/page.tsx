import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSession, isMentor } from "@/lib/auth";
import { postById, commentsFor } from "@/lib/queries/brothers";
import { PostCard } from "@/components/brothers/post-card";
import { Comments } from "./comments";

export const metadata: Metadata = { title: "Post" };

export default async function PostPage(props: PageProps<"/brothers/[postId]">) {
  const { postId } = await props.params;
  const { supabase, userId, profile } = await requireSession();
  const [post, comments] = await Promise.all([postById(supabase, userId, postId), commentsFor(supabase, postId)]);
  if (!post) notFound();
  return (
    <div className="flex flex-col gap-4">
      <PostCard post={post} viewerId={userId} viewerIsMentor={isMentor(profile)} detail />
      <Comments postId={post.id} viewerId={userId} viewerIsMentor={isMentor(profile)} viewerName={profile.display_name} viewerAvatar={profile.avatar_url}
        comments={comments.map((c) => ({ id: c.id, body: c.body, created_at: c.created_at, author_id: c.author_id, author: { display_name: c.author.display_name, avatar_url: c.author.avatar_url, role: c.author.role } }))} />
    </div>
  );
}
