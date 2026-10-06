import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 grid place-items-center px-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <p className="eyebrow">404</p>
        <h1 className="display text-2xl font-semibold text-ink">That page isn&apos;t here.</h1>
        <p className="text-ink-2 max-w-[32ch]">The link may be old, or the post was removed.</p>
        <Link href="/today" className="mt-2 inline-flex h-11 items-center rounded-xl bg-green px-5 font-semibold text-on-green">Back to Today</Link>
      </div>
    </div>
  );
}
