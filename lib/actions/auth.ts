"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AuthState {
  error?: string;
  notice?: string;
}

function safeNext(value: FormDataEntryValue | null): string {
  const s = typeof value === "string" ? value : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/today";
}

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Check your inbox for the confirmation link before signing in." };
    }
    return { error: "That email and password don't match. Try again." };
  }
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const inviteCode = String(formData.get("invite_code") ?? "").trim();
  if (name.length < 2) return { error: "Tell us what to call you." };
  if (!email.includes("@")) return { error: "Enter a valid email." };
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };
  if (!inviteCode) return { error: "Enter the invite code a mentor gave you." };

  const supabase = await createClient();

  // Checked through a database function so no one can read the list of codes.
  const { data: codeIsValid, error: codeError } = await supabase.rpc("validate_invite_code", { p_code: inviteCode });
  if (codeError) return { error: "Couldn't check that invite code. Try again in a moment." };
  if (!codeIsValid) return { error: "That invite code isn't valid. Ask a mentor for a current one." };

  // Public sign-ups are switched off in Supabase, so the account is created here with the
  // service-role key. That way the invite code cannot be skipped by calling the API directly.
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Sign-up isn't configured yet. Tell a mentor the server is missing its key." };
  }

  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: name },
  });
  if (createError) {
    const message = createError.message.toLowerCase();
    if (message.includes("already") || message.includes("registered") || message.includes("exists")) {
      return { error: "There's already an account with that email. Sign in instead." };
    }
    return { error: "Couldn't create your account. Try again." };
  }

  await supabase.rpc("consume_invite_code", { p_code: inviteCode });

  // Sign the new member in on this browser so the session cookie is set.
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return { notice: "Your account is ready. Sign in to continue." };
  }
  redirect("/onboarding");
}

/**
 * Email a reset link. Always answers the same way so the form can't be used to find out
 * which emails have accounts. The link lands on /auth/confirm, which signs the member in
 * for this one purpose and sends them to /reset-password.
 */
export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return { error: "Enter the email you signed up with." };
  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/confirm?next=/reset-password` });
  if (error && error.status === 429) return { error: "Too many reset emails just went out. Try again in an hour, or ask a mentor." };
  return { notice: "If that email has an account, a reset link is on its way. Open it on this same phone. Nothing after a few minutes? Check spam, or ask an admin to reset it for you." };
}

/** Set a new password for whoever is signed in: after a reset link, or from Settings. */
export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) return { error: "Use a password of at least 8 characters." };
  if (password !== confirm) return { error: "Those two passwords don't match." };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "That reset link has expired. Request a new one." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: error.code === "same_password" ? "That's your current password. Pick a new one." : "Couldn't update the password. Try again." };
  }
  if (formData.get("then") === "today") redirect("/today");
  return { notice: "Password updated." };
}

/**
 * Admin-only fallback for when email can't reach the member: set a temporary password and
 * show it once so the admin can pass it on in person. The member should change it in Settings.
 */
export async function adminResetPassword(targetId: string): Promise<{ error?: string; password?: string }> {
  const { profile } = await requireSession();
  if (profile.role !== "admin") return { error: "Only an admin can reset passwords." };
  // Readable and unambiguous: no 0/O, 1/I/l. 12 characters from a 54-character alphabet.
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(12));
  const password = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("").replace(/(.{4})(?!$)/g, "$1-");
  let admin: ReturnType<typeof createAdminClient>;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "The server is missing its service key." };
  }
  const { error } = await admin.auth.admin.updateUserById(targetId, { password });
  if (error) return { error: "Couldn't reset that password." };
  return { password };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}
