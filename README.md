# KOD: Kings of Distinction discipleship app

A mobile-first web app for the young men of **[Kings of Distinction](https://kingsofdistinction.com)**,
a Memphis 501(c)(3) led by founder and CEO Le Marquee. KOD mentors fatherless and under-guided
young men aged 15 to 27 through the city's only public Rite of Passage training: one-on-one
mentorship, character development, brotherhood, and a manhood ceremony.

> *"To build a generational pipeline of leaders & legacy builders who transform the world through
> faith, education, and economic empowerment from childhood to adulthood."*

## Why this app exists

The program builds habits in the room, but young men spend most of the week alone with their
phones. KOD gives them one place to keep growing between sessions, organised around the four
quarters of the KOD crest:

| Pillar | What members do |
|---|---|
| **Word** | Verse of the day (shareable as an image), reading plans, a full KJV reader, memory verses, a teaching video library |
| **Prayer** | A prayer list with answered prayers, and a guided nightly journal: *What made you grateful? What are you proud of? How did you advance the Kingdom today?* |
| **Brotherhood** | A moderated community feed, live chat, accountability partners who can see each other's progress, group challenges |
| **Growth** | Daily habits and streaks, goals with steps, workouts (including custom and mentor-assigned), budgeting with savings goals and a monthly money reflection, screen-time goals and focus sessions, a monthly report by pillar |

## How it's built

- **Next.js 16** (App Router, React 19, TypeScript strict) and **Tailwind CSS v4**, deployed on **Vercel**
- **Supabase**: Postgres, Auth, and Realtime for live chat
- **Row-level security on every table.** The database, not the UI, decides who can read what:
  your journal is yours alone, accountability partners can see each other's habits and screen time,
  and mentors can moderate shared spaces.
- **Invite-only membership.** Public sign-ups are switched off; accounts are created on the server
  only after an invite code checks out, so the sign-up API can't be called directly.
- **Built for a youth audience.** Members include teenagers, so the feed and chat are mentor-moderated,
  posts always show their author, and there's no anonymous posting.
- **Server actions for every write.** No client-side database writes.
- **Shareable Scripture images** generated on the fly with `next/og`.
- The **King James Version** (public domain) ships with the app, so reading works without a third-party API.

Brand colours come from the crest: green `#1B4B23`, navy `#0D263C`, gold `#C6A15F`.

## Usage and license

The code is shared publicly so people can see the work. It is **not open source**: © Kings of
Distinction. All rights reserved. Please don't reuse or redeploy it without permission. Questions:
[kingsofdistinction.com/contact](https://kingsofdistinction.com/contact).

Built by [Kwabena Appau](https://www.linkedin.com/in/kwabena-appau-junior) for Kings of Distinction.

## Run it locally

```bash
pnpm install
cp .env.example .env.local   # then fill in your Supabase URL and anon key
pnpm dev
```

Open http://localhost:3000. Database setup is in [`supabase/README.md`](supabase/README.md).

## Structure

```
app/
  (auth)/         sign-in, sign-up
  (app)/          signed-in shell with the five tabs
    today/        greeting, verse of the day, today's reading, habit check-in, goals, mentor note, featured video
    word/         reading plans, KJV reader, memory verses, videos, saved
    brothers/     feed, post detail, members, partners, challenges
    growth/       habits week grid, goals, planner, journal, prayer, body, finance, monthly report
    me/           profile, distinctions, milestones, vault, settings, mentor tools
  onboarding/     name, cohort, reading plan
  auth/confirm/   target of Supabase email links
components/       ui primitives, nav, feature components
lib/
  actions/        server actions (all mutations)
  queries/        read helpers
  bible/          books index, reference parsing, plans, KJV loader, memory verses
  data/           pillars, workouts, merch, badges
  supabase/       browser/server clients, proxy helper, Database types
supabase/
  migrations/     schema, RLS policies, new-user trigger, seed videos
proxy.ts          session refresh + auth redirects (Next.js 16 "proxy", formerly middleware)
```

## Roles

`member` (default), `mentor` (moderate the feed, pin notes, manage videos), `admin` (mentor plus role changes). Promote the first admin with SQL; see `supabase/README.md`.

## Deploy

Push to GitHub, import the repo in Vercel, add the two `NEXT_PUBLIC_SUPABASE_*` variables plus `NEXT_PUBLIC_SITE_URL` (your production URL), and deploy. Add the production URL to Supabase → Authentication → URL Configuration.

## Scripts

```bash
pnpm dev          # local dev server
pnpm build        # production build
pnpm lint         # eslint
pnpm exec tsc --noEmit   # typecheck
```

## Regenerating the Bible text

`public/bible/kjv/*.json` is generated from a public-domain KJV dataset. To rebuild it:

```bash
curl -sL -o scripts/en_kjv.json https://raw.githubusercontent.com/thiagobodruk/bible/master/json/en_kjv.json
python3 scripts/build-bible.py
```

The script keeps the words the translators supplied for English sense and drops their
marginal notes, which the source file marks with the same brace syntax.
