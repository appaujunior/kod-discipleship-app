# Database setup

1. Create a project at https://supabase.com (free tier is fine).
2. Open **SQL Editor → New query**, paste the contents of `migrations/0001_init.sql`, and run it.
3. In **Authentication → Providers → Email**, leave Email enabled. For the smoothest first launch, turn **Confirm email** off; turn it back on before inviting the full group.
4. In **Authentication → URL Configuration**, set Site URL to your app URL (http://localhost:3000 for local) and add `http://localhost:3000/auth/confirm` and your production URL to Redirect URLs.
5. Copy **Project Settings → API → Project URL** and **anon public key** into `.env.local` (see `.env.example`).

## Make yourself admin

After you sign up in the app once, run `migrations/0003_fix_first_admin.sql` in the SQL
Editor, changing the email in it to yours. That migration also repairs the role guard, which
originally refused role changes from the SQL Editor and so made the first admin impossible.

Once one admin exists, further promotions happen in the app under Me → Mentor tools → Members.

Admins can promote mentors from the app (Me → Mentor tools → Members).

## Invite-only sign-up

Two pieces work together so an invite code cannot be skipped:

1. **Public sign-ups are switched off in Supabase.** Authentication → Sign In / Providers →
   turn **Allow new users to sign up** off. This makes Supabase reject any direct call to its
   sign-up API, including one made with the public anon key.
2. **The app creates accounts itself** using the service-role key, but only after it has
   checked the invite code. That key lives in `SUPABASE_SERVICE_ROLE_KEY`, server-side only.

If you skip step 1, the invite code only guards the app's own sign-up screen and someone
technical could still create an account through the API directly.

### Adding the service-role key

Copy it from **Project Settings → API Keys → service_role** (click Reveal). It grants full
access to the database, so treat it like a password: never put it in the browser, in git, or
in a chat window.

Local:

```bash
echo 'SUPABASE_SERVICE_ROLE_KEY=paste-it-here' >> .env.local
```

Live, which prompts for the value rather than putting it in your shell history:

```bash
pnpm dlx vercel env add SUPABASE_SERVICE_ROLE_KEY production --type secret
```

Then redeploy with `pnpm dlx vercel deploy --prod`.
