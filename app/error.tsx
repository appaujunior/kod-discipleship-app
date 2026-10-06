"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex-1 grid place-items-center px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <p className="eyebrow">Something broke</p>
        <h1 className="display text-2xl font-semibold text-ink">We couldn&apos;t load that.</h1>
        <p className="text-ink-2 max-w-[36ch]">Try again. If it keeps happening, tell a mentor what you were doing.</p>
        <button type="button" onClick={reset} className="mt-2 inline-flex h-11 items-center rounded-xl bg-green px-5 font-semibold text-on-green">Try again</button>
      </div>
    </div>
  );
}
