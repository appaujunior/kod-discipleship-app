"use client";

import { useState } from "react";
import { Share2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shares a verse as a branded image. Uses the native share sheet with the PNG where the
 * browser supports file sharing (iPhone Safari, Android Chrome), so it can go straight to
 * Instagram, Snapchat or Messages; otherwise shares the text, or downloads the image.
 */
export function ShareVerseButton({ reference, text, dark = false }: { reference: string; text: string; dark?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string>();
  const caption = `“${text}” — ${reference} (KJV)\n\nKings of Distinction · I am my brother's keeper`;

  const share = async () => {
    setBusy(true);
    setNote(undefined);
    try {
      const res = await fetch(`/share/verse?ref=${encodeURIComponent(reference)}`);
      const blob = res.ok ? await res.blob() : null;
      const file = blob ? new File([blob], `${reference.replace(/[^\w]+/g, "-")}.png`, { type: "image/png" }) : null;
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: caption });
      } else if (navigator.share) {
        await navigator.share({ text: caption });
      } else if (blob) {
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement("a"), { href: url, download: file!.name });
        a.click();
        URL.revokeObjectURL(url);
        setNote("Image saved");
      } else {
        await navigator.clipboard.writeText(caption);
        setNote("Copied");
      }
    } catch (err) {
      // AbortError means the member closed the share sheet; anything else is a real failure.
      if (!(err instanceof DOMException && err.name === "AbortError")) setNote("Couldn't share");
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      {note && <span className={cn("text-xs", dark ? "text-white/70" : "text-ink-3")} role="status">{note}</span>}
      <button type="button" onClick={share} disabled={busy} aria-label="Share verse" className={cn("inline-flex size-8 items-center justify-center rounded-full transition-colors", dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-ink-3 hover:bg-surface-2 hover:text-ink")}>
        {busy ? <Loader2 className="size-[18px] animate-spin" /> : <Share2 className="size-[18px]" />}
      </button>
    </span>
  );
}
