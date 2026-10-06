"use client";

import { useState, useTransition } from "react";
import { KeyRound, Copy, Check } from "lucide-react";
import { adminResetPassword } from "@/lib/actions/auth";

/** Admin-only: give a member a temporary password, shown here once to pass on in person. */
export function ResetPasswordButton({ userId, name }: { userId: string; name: string }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ error?: string; password?: string }>();
  const [copied, setCopied] = useState(false);

  if (result?.password) {
    return (
      <div className="basis-full mt-2 rounded-xl bg-gold-soft px-3 py-2.5 text-sm">
        <p className="text-ink-2">Temporary password for {name}. Give it to him in person, then he changes it in Me → Settings. It won&apos;t be shown again.</p>
        <div className="mt-1.5 flex items-center gap-2">
          <code className="flex-1 font-mono text-[15px] font-semibold text-ink tracking-wide select-all">{result.password}</code>
          <button type="button" aria-label="Copy password" onClick={() => { navigator.clipboard.writeText(result.password!); setCopied(true); }} className="text-ink-2 hover:text-ink">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>
    );
  }
  return (
    <>
      <button
        type="button"
        disabled={pending}
        aria-label={`Reset password for ${name}`}
        title="Reset password"
        onClick={() => { if (confirm(`Reset ${name}'s password? His current password stops working right away.`)) start(async () => setResult(await adminResetPassword(userId))); }}
        className="inline-flex size-9 items-center justify-center rounded-lg text-ink-3 hover:bg-surface-2 hover:text-ink disabled:opacity-50"
      >
        <KeyRound className="size-4" />
      </button>
      {result?.error && <p role="alert" className="basis-full text-xs text-danger">{result.error}</p>}
    </>
  );
}
