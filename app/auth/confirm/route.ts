import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Target of Supabase email links (confirm sign-up, magic link, recovery). */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  const supabase = await createClient();
  let ok = false;
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  // `next` comes from our own redirectTo; only same-site paths are honoured.
  const next = searchParams.get("next");
  const target = type === "recovery" ? "/reset-password" : next && next.startsWith("/") && !next.startsWith("//") ? next : "/onboarding";

  const url = request.nextUrl.clone();
  url.search = "";
  url.pathname = ok ? target : "/sign-in";
  if (!ok) url.searchParams.set("error", "link");
  return NextResponse.redirect(url);
}
