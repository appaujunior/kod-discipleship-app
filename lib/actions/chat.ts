"use server";

import { requireSession, isMentor } from "@/lib/auth";
import { CHAT_AUTHOR, type ChatMessage } from "@/lib/queries/chat";

/** Post to the all-members chat. Returns the saved message so the sender sees it even before realtime echoes it. */
export async function sendChatMessage(body: string): Promise<{ error?: string; message?: ChatMessage }> {
  const clean = body.trim();
  if (!clean) return { error: "Write something first." };
  if (clean.length > 1000) return { error: "Keep it under 1000 characters." };
  const { supabase, userId } = await requireSession();
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ author_id: userId, body: clean })
    .select(`*, ${CHAT_AUTHOR}`)
    .single()
    .overrideTypes<ChatMessage, { merge: false }>();
  if (error || !data) return { error: "Couldn't send. Try again." };
  return { message: data };
}

export async function setChatMessageHidden(id: string, hidden: boolean): Promise<void> {
  const { supabase, userId, profile } = await requireSession();
  if (!isMentor(profile)) throw new Error("Mentors only");
  await supabase.from("chat_messages").update({ hidden_at: hidden ? new Date().toISOString() : null, hidden_by: hidden ? userId : null }).eq("id", id);
}

export async function deleteChatMessage(id: string): Promise<void> {
  const { supabase } = await requireSession();
  // RLS allows the author or a mentor; anyone else deletes nothing.
  await supabase.from("chat_messages").delete().eq("id", id);
}
