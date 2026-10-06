import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, ChatMessageRow } from "@/lib/supabase/types";
import type { Author } from "./brothers";

export type ChatMessage = ChatMessageRow & { author: Author };

export const CHAT_AUTHOR = "author:profiles!chat_messages_author_id_fkey(id, display_name, avatar_url, role)";

/** The most recent chat messages the viewer may see (RLS hides moderated ones), oldest first. */
export async function recentChat(supabase: SupabaseClient<Database>, limit = 100): Promise<ChatMessage[]> {
  const { data } = await supabase
    .from("chat_messages")
    .select(`*, ${CHAT_AUTHOR}`)
    .order("created_at", { ascending: false })
    .limit(limit)
    .overrideTypes<(ChatMessageRow & { author: Author | null })[], { merge: false }>();
  return (data ?? []).filter((m): m is ChatMessage => !!m.author).reverse();
}
