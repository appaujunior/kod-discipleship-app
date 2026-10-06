import type { Metadata } from "next";
import { requireSession, isMentor } from "@/lib/auth";
import { recentChat } from "@/lib/queries/chat";
import { ChatRoom } from "@/components/brothers/chat-room";

export const metadata: Metadata = { title: "Chat" };

export default async function ChatPage() {
  const { supabase, userId, profile } = await requireSession();
  const messages = await recentChat(supabase);
  return <ChatRoom initial={messages} viewer={{ id: userId, isMentor: isMentor(profile) }} />;
}
