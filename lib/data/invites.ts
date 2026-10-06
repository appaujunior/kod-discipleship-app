import type { InviteCodeRow } from "@/lib/supabase/types";

export type InviteStatus = "live" | "off" | "expired" | "used-up";

export const INVITE_STATUS_LABEL: Record<InviteStatus, string> = {
  live: "Live",
  off: "Off",
  expired: "Expired",
  "used-up": "Used up",
};

type InviteLike = Pick<InviteCodeRow, "active" | "expires_at" | "max_uses" | "uses">;

/** Whether a code can still be redeemed, and if not, why. */
export function inviteStatus(code: InviteLike, now: Date = new Date()): InviteStatus {
  if (!code.active) return "off";
  if (code.expires_at && new Date(code.expires_at) < now) return "expired";
  if (code.max_uses !== null && code.uses >= code.max_uses) return "used-up";
  return "live";
}
