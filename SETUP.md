# Getting KOD running

Two things stand between you and a working app: a Supabase project (about 5 minutes)
and pasting two keys into a file. Everything else is already built.

## 1. Create the Supabase project

1. Go to https://supabase.com and sign in with GitHub.
2. **New project.** Name it `kod`. Choose a strong database password and save it in your
   password manager. Pick the region closest to Memphis (`us-east-1`). Free plan is fine.
3. Wait about two minutes for it to finish provisioning.

## 2. Create the tables

1. In your project, open **SQL Editor** in the left sidebar, then **New query**.
2. Open `supabase/migrations/0001_init.sql` from this repo, copy the whole file, and paste it in.
3. Click **Run**. It should say "Success. No rows returned."

That one script creates every table, locks them down with row-level security, sets up the
trigger that gives each new member the twelve starting habits, and loads the three videos.

## 3. Turn off email confirmation for now

1. Go to **Authentication → Sign In / Providers → Email**.
2. Switch **Confirm email** off, and save.

This lets you and the first few brothers sign in immediately. Turn it back on before you
invite the whole group, and at that point add your production URL under
**Authentication → URL Configuration → Redirect URLs** as `https://YOUR-DOMAIN/auth/confirm`.

## 4. Paste your keys

1. Go to **Project Settings → API Keys**.
2. Copy the **Project URL** and the **anon public** key.
3. Open `.env.local` in this repo and replace the two placeholder lines:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

The anon key is safe in the browser. Row-level security is what protects the data, and it
is already switched on for every table.

## 5. Run it

```bash
pnpm dev
```

Open http://localhost:3000, create your account, and finish the short setup.

## 6. Make yourself admin

After you have signed up once, run this in the Supabase **SQL Editor**, using your own email:

```sql
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
```

Refresh the app. **Me → Mentor tools** appears, and from there you can promote mentors,
review reported posts, pin a word to everyone's Today screen, and add videos.

## 7. Put it online

1. Push this folder to a GitHub repo.
2. At https://vercel.com, **Add New → Project**, and import that repo.
3. Under Environment Variables add the same three names from `.env.local`, but set
   `NEXT_PUBLIC_SITE_URL` to your Vercel URL.
4. Deploy. Then in Supabase, set **Authentication → URL Configuration → Site URL** to that
   same address.

Brothers install it by opening the site on their phone, tapping Share, then
**Add to Home Screen**. It then opens full screen with the crest as its icon.

---

## One thing to fix first: git

Git on this Mac is the Xcode placeholder and refuses to run until the licence is accepted.
You will need it for step 7. In Terminal, run this and press space to page through, then type
`agree`:

```bash
sudo xcodebuild -license
```

Nothing else in the app depends on it.
