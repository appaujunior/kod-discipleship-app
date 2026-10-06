"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { requestPartner, respondPartner, endPartnership } from "@/lib/actions/brothers";
import { Button } from "@/components/ui/button";

export function PartnerRequestButton({ partnerId }: { partnerId: string }) {
  const [pending, start] = useTransition();
  const [sent, setSent] = useState(false);
  return <Button size="sm" variant="outline" disabled={pending || sent} onClick={() => start(async () => { await requestPartner(partnerId); setSent(true); })}><UserPlus className="size-4" aria-hidden />{sent ? "Sent" : "Partner up"}</Button>;
}

export function RespondButtons({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <span className="flex gap-1.5">
      <Button size="sm" disabled={pending} onClick={() => start(() => respondPartner(id, true))}>Accept</Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => start(() => respondPartner(id, false))}>Decline</Button>
    </span>
  );
}

export function EndButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return <Button size="sm" variant="ghost" disabled={pending} onClick={() => { if (confirm("End this partnership?")) start(() => endPartnership(id)); }}>End</Button>;
}
