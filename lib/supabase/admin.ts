import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./env";
import type { Database } from "./types";

/**
 * Supabase client holding the service-role key, which bypasses row-level security.
 *
 * Only ever import this from server code. The key is deliberately NOT prefixed with
 * NEXT_PUBLIC_, so Next.js will refuse to bundle it into anything the browser downloads.
 * It exists so the server can create accounts while public sign-ups stay switched off
 * in Supabase, which is what stops anyone calling the sign-up API directly.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Sign-up needs it to create accounts. " +
        "Add it to .env.local for local work and to the Vercel project for the live site. " +
        "Steps are in supabase/README.md.",
    );
  }
  return createSupabaseClient<Database>(supabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
