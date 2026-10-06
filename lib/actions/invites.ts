"use server";

import { revalidatePath } from "next/cache";
import { requireSession, isMentor } from "@/lib/auth";

export interface InviteState {
  error?: string;
  ok?: boolean;
}

const CODE_RE = /^[A-Z0-9-]{4,24}$/;

function refresh() {
  revalidatePath("/me/mentor/invites");
  revalidatePath("/me/mentor");
}

/** Mentors create a code. Blank limits mean unlimited uses and no expiry. */
export async function createInvite(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const { supabase, userId, profile } = await requireSession();
  if (!isMentor(profile)) return { error: "Mentors only." };

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const label = String(formData.get("label") ?? "").trim() || null;
  const maxUsesRaw = String(formData.get("max_uses") ?? "").trim();
  const expiresRaw = String(formData.get("expires_on") ?? "").trim();

  if (!CODE_RE.test(code)) {
    return { error: "Use 4 to 24 characters: letters, numbers, or dashes." };
  }
  const maxUses = maxUsesRaw ? Number(maxUsesRaw) : null;
  if (maxUses !== null && !(Number.isInteger(maxUses) && maxUses > 0)) {
    return { error: "Max uses must be a whole number above zero, or blank for unlimited." };
  }
  if (expiresRaw && !/^\d{4}-\d{2}-\d{2}$/.test(expiresRaw)) {
    return { error: "That expiry date isn't valid." };
  }

  const { error } = await supabase.from("invite_codes").insert({
    code,
    label,
    created_by: userId,
    max_uses: maxUses,
    // Codes stay usable through the end of the chosen day.
    expires_at: expiresRaw ? `${expiresRaw}T23:59:59Z` : null,
  });
  if (error) {
    return { error: error.code === "23505" ? "That code already exists." : "Couldn't create the code." };
  }
  refresh();
  return { ok: true };
}

export async function setInviteActive(code: string, active: boolean): Promise<void> {
  const { supabase, profile } = await requireSession();
  if (!isMentor(profile)) throw new Error("Mentors only");
  await supabase.from("invite_codes").update({ active }).eq("code", code);
  refresh();
}

export async function deleteInvite(code: string): Promise<void> {
  const { supabase, profile } = await requireSession();
  if (!isMentor(profile)) throw new Error("Mentors only");
  await supabase.from("invite_codes").delete().eq("code", code);
  refresh();
}
