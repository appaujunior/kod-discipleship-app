"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createPost, type PostFormState } from "@/lib/actions/brothers";
import { POST_KINDS } from "@/lib/queries/brothers";
import type { PostKind } from "@/lib/supabase/types";
import { SubmitButton } from "@/components/ui/button";
import { Textarea, FormError } from "@/components/ui/form";
import { Avatar } from "@/components/ui/bits";
import { cn } from "@/lib/utils";

export function Composer({ name, avatar }: { name: string; avatar: string | null }) {
  const [state, action] = useActionState<PostFormState, FormData>(createPost, {});
  const [kind, setKind] = useState<PostKind>("checkin");
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state.ok]);
  const meta = POST_KINDS.find((k) => k.key === kind)!;
  return (
    <form ref={ref} action={action} className="rounded-card border border-line bg-surface p-3 flex flex-col gap-3">
      <input type="hidden" name="kind" value={kind} />
      <div className="flex gap-3">
        <Avatar name={name} src={avatar} size={36} />
        <Textarea name="body" placeholder={meta.prompt} rows={2} required maxLength={2000} className="min-h-14 border-0 bg-transparent px-0 py-1.5 focus:ring-0 resize-none" aria-label="New post" />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 py-0.5">
        {POST_KINDS.map((k) => (
          <button key={k.key} type="button" onClick={() => setKind(k.key)} aria-pressed={kind === k.key} className={cn("shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors", kind === k.key ? "border-green bg-green-soft text-green" : "border-line text-ink-3 hover:text-ink")}>{k.label}</button>
        ))}
        </div>
        <span className="flex-1" />
        <SubmitButton size="sm" className="shrink-0">Post</SubmitButton>
      </div>
      <FormError message={state.error} />
    </form>
  );
}
