-- KOD discipleship app: initial schema.
-- Run in Supabase → SQL Editor (or `supabase db push`). Safe to run once on a fresh project.

create extension if not exists "pgcrypto";

-- ---------- Profiles & roles ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  avatar_url text,
  role text not null default 'member' check (role in ('member', 'mentor', 'admin')),
  cohort text,
  bio text,
  timezone text not null default 'America/Chicago',
  onboarded boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.is_mentor()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('mentor', 'admin'));
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- Only admins may change a role.
create or replace function public.protect_profile_role()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role and not public.is_admin() then
    raise exception 'Only an admin can change roles';
  end if;
  return new;
end;
$$;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---------- Growth: habits & goals ----------
create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  pillar text not null check (pillar in ('word', 'prayer', 'brotherhood', 'growth')),
  title text not null,
  detail text,
  target_per_week int not null default 7 check (target_per_week between 1 and 7),
  sort_order int not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);
create index habits_user_idx on public.habits (user_id);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);
create index habit_logs_user_date_idx on public.habit_logs (user_id, log_date);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  pillar text not null check (pillar in ('word', 'prayer', 'brotherhood', 'growth')),
  title text not null,
  why text,
  due_date date,
  status text not null default 'active' check (status in ('active', 'done', 'archived')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index goals_user_idx on public.goals (user_id);

create table public.goal_steps (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  done_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index goal_steps_goal_idx on public.goal_steps (goal_id);

create table public.weekly_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  week_start date not null,
  focus text,
  notes text,
  created_at timestamptz not null default now(),
  unique (user_id, week_start)
);

-- ---------- Word: reading plans & memory verses ----------
create table public.user_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_slug text not null,
  started_on date not null default current_date,
  unique (user_id, plan_slug)
);

create table public.plan_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  plan_slug text not null,
  day_number int not null,
  completed_at timestamptz not null default now(),
  unique (user_id, plan_slug, day_number)
);

create table public.memory_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  verse_id int not null,
  status text not null default 'learning' check (status in ('learning', 'mastered')),
  review_count int not null default 0,
  last_reviewed_at timestamptz,
  unique (user_id, verse_id)
);

-- ---------- Prayer & journal ----------
create table public.prayers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  detail text,
  answered_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  entry_date date not null,
  body text not null,
  mood text,
  created_at timestamptz not null default now()
);
create index journal_user_date_idx on public.journal_entries (user_id, entry_date desc);

-- ---------- Brothers: community ----------
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null default 'checkin' check (kind in ('checkin', 'prayer', 'win', 'question')),
  body text not null check (char_length(body) between 1 and 2000),
  hidden_at timestamptz,
  hidden_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);
create index posts_created_idx on public.posts (created_at desc);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  hidden_at timestamptz,
  hidden_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);
create index comments_post_idx on public.comments (post_id, created_at);

create table public.reactions (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('praying', 'with_you', 'amen')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id, kind)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.posts (id) on delete cascade,
  comment_id uuid references public.comments (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  resolved_by uuid references public.profiles (id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.mentor_notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  pinned_until date,
  created_at timestamptz not null default now()
);

create table public.partnerships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  partner_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'active', 'ended')),
  created_at timestamptz not null default now(),
  unique (requester_id, partner_id),
  check (requester_id <> partner_id)
);

create table public.challenges (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  starts_on date not null,
  ends_on date not null,
  created_at timestamptz not null default now(),
  check (ends_on >= starts_on)
);

create table public.challenge_members (
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (challenge_id, user_id)
);

create table public.challenge_checkins (
  challenge_id uuid not null references public.challenges (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  checkin_date date not null,
  primary key (challenge_id, user_id, checkin_date)
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  youtube_id text not null unique,
  title text not null,
  channel text,
  topic text,
  added_by uuid references public.profiles (id) on delete set null,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Me: saved, badges, milestones, finance, body ----------
create table public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('verse', 'video')),
  ref text not null,
  created_at timestamptz not null default now(),
  unique (user_id, kind, ref)
);

create table public.distinctions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge)
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  category text not null default 'life',
  target_date date,
  achieved_at date,
  created_at timestamptz not null default now()
);

create table public.finance_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null check (kind in ('income', 'fixed', 'variable')),
  label text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  month date not null,
  created_at timestamptz not null default now()
);
create index finance_user_month_idx on public.finance_entries (user_id, month);

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null default 'other',
  label text not null,
  value numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  workout_slug text not null,
  done_on date not null,
  created_at timestamptz not null default now()
);

-- ---------- New-user setup: profile + the twelve default habits ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  name text;
begin
  name := coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), split_part(new.email, '@', 1));
  insert into public.profiles (id, display_name) values (new.id, name);

  insert into public.habits (user_id, pillar, title, detail, target_per_week, sort_order) values
    (new.id, 'word',        'Read today''s passage',        'From your active reading plan',            7, 1),
    (new.id, 'word',        'Review a memory verse',        'Say it out loud, then mark it',            7, 2),
    (new.id, 'word',        'Watch one teaching',           'From the video library',                   2, 3),
    (new.id, 'prayer',      'Morning prayer',               'Before the phone opens anything else',     7, 4),
    (new.id, 'prayer',      'Pray for a brother by name',   'Pick one from the members list',           7, 5),
    (new.id, 'prayer',      'Evening reflection',           'Three lines in the journal',               7, 6),
    (new.id, 'brotherhood', 'Check in with your partner',   'Message or call your accountability partner', 7, 7),
    (new.id, 'brotherhood', 'Be honest in the feed',        'Post a check-in or answer someone''s',     3, 8),
    (new.id, 'brotherhood', 'Serve someone',                'Family, a brother, or a stranger',         1, 9),
    (new.id, 'growth',      'Move your body',               'Workout, run, or a 30-minute walk',        4, 10),
    (new.id, 'growth',      'One step on a goal',           'Any step, however small',                  7, 11),
    (new.id, 'growth',      'Money check',                  'Log spending, review the budget',          1, 12);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Row-level security ----------
alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.goals enable row level security;
alter table public.goal_steps enable row level security;
alter table public.weekly_plans enable row level security;
alter table public.user_plans enable row level security;
alter table public.plan_progress enable row level security;
alter table public.memory_progress enable row level security;
alter table public.prayers enable row level security;
alter table public.journal_entries enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.reactions enable row level security;
alter table public.reports enable row level security;
alter table public.mentor_notes enable row level security;
alter table public.partnerships enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_members enable row level security;
alter table public.challenge_checkins enable row level security;
alter table public.videos enable row level security;
alter table public.saved_items enable row level security;
alter table public.distinctions enable row level security;
alter table public.milestones enable row level security;
alter table public.finance_entries enable row level security;
alter table public.assets enable row level security;
alter table public.workout_logs enable row level security;

-- Profiles: every member can see every member; you edit yourself; admins edit anyone.
create policy "profiles read" on public.profiles for select to authenticated using (true);
create policy "profiles update own" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- Personal tables: owner has full access. Mentors may read habits, logs, and goals.
do $$
declare t text;
begin
  foreach t in array array['habits','habit_logs','goals','goal_steps','weekly_plans','user_plans','plan_progress',
                           'memory_progress','prayers','journal_entries','saved_items','distinctions','milestones',
                           'finance_entries','assets','workout_logs']
  loop
    execute format('create policy "%1$s owner all" on public.%1$I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
  foreach t in array array['habits','habit_logs','goals']
  loop
    execute format('create policy "%1$s mentor read" on public.%1$I for select to authenticated using (public.is_mentor())', t);
  end loop;
end $$;

-- Posts & comments: visible unless hidden; authors and mentors always see them; mentors can hide.
create policy "posts read" on public.posts for select to authenticated
  using (hidden_at is null or author_id = auth.uid() or public.is_mentor());
create policy "posts insert own" on public.posts for insert to authenticated with check (author_id = auth.uid());
create policy "posts update" on public.posts for update to authenticated
  using (author_id = auth.uid() or public.is_mentor()) with check (author_id = auth.uid() or public.is_mentor());
create policy "posts delete" on public.posts for delete to authenticated using (author_id = auth.uid() or public.is_mentor());

create policy "comments read" on public.comments for select to authenticated
  using (hidden_at is null or author_id = auth.uid() or public.is_mentor());
create policy "comments insert own" on public.comments for insert to authenticated with check (author_id = auth.uid());
create policy "comments update" on public.comments for update to authenticated
  using (author_id = auth.uid() or public.is_mentor()) with check (author_id = auth.uid() or public.is_mentor());
create policy "comments delete" on public.comments for delete to authenticated using (author_id = auth.uid() or public.is_mentor());

create policy "reactions read" on public.reactions for select to authenticated using (true);
create policy "reactions insert own" on public.reactions for insert to authenticated with check (user_id = auth.uid());
create policy "reactions delete own" on public.reactions for delete to authenticated using (user_id = auth.uid());

create policy "reports insert own" on public.reports for insert to authenticated with check (reporter_id = auth.uid());
create policy "reports mentor read" on public.reports for select to authenticated using (public.is_mentor() or reporter_id = auth.uid());
create policy "reports mentor update" on public.reports for update to authenticated using (public.is_mentor()) with check (public.is_mentor());

create policy "mentor notes read" on public.mentor_notes for select to authenticated using (true);
create policy "mentor notes write" on public.mentor_notes for all to authenticated using (public.is_mentor()) with check (public.is_mentor());

create policy "partnerships read" on public.partnerships for select to authenticated
  using (requester_id = auth.uid() or partner_id = auth.uid() or public.is_mentor());
create policy "partnerships insert" on public.partnerships for insert to authenticated with check (requester_id = auth.uid());
create policy "partnerships update" on public.partnerships for update to authenticated
  using (requester_id = auth.uid() or partner_id = auth.uid()) with check (requester_id = auth.uid() or partner_id = auth.uid());

create policy "challenges read" on public.challenges for select to authenticated using (true);
create policy "challenges insert" on public.challenges for insert to authenticated with check (creator_id = auth.uid());
create policy "challenges update" on public.challenges for update to authenticated
  using (creator_id = auth.uid() or public.is_mentor()) with check (creator_id = auth.uid() or public.is_mentor());
create policy "challenges delete" on public.challenges for delete to authenticated using (creator_id = auth.uid() or public.is_mentor());
create policy "challenge members read" on public.challenge_members for select to authenticated using (true);
create policy "challenge members join" on public.challenge_members for insert to authenticated with check (user_id = auth.uid());
create policy "challenge members leave" on public.challenge_members for delete to authenticated using (user_id = auth.uid());
create policy "challenge checkins read" on public.challenge_checkins for select to authenticated using (true);
create policy "challenge checkins own" on public.challenge_checkins for insert to authenticated with check (user_id = auth.uid());
create policy "challenge checkins undo" on public.challenge_checkins for delete to authenticated using (user_id = auth.uid());

-- Accountability partners can see each other's habits and completions.
create or replace function public.is_partner_of(other uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.partnerships p
    where p.status = 'active'
      and ((p.requester_id = auth.uid() and p.partner_id = other) or (p.partner_id = auth.uid() and p.requester_id = other))
  );
$$;
create policy "habits partner read" on public.habits for select to authenticated using (public.is_partner_of(user_id));
create policy "habit logs partner read" on public.habit_logs for select to authenticated using (public.is_partner_of(user_id));

create policy "videos read" on public.videos for select to authenticated using (true);
create policy "videos mentor write" on public.videos for all to authenticated using (public.is_mentor()) with check (public.is_mentor());

-- ---------- Seed: starting video library ----------
insert into public.videos (youtube_id, title, channel, topic, featured) values
  ('BxY_eJLBflk', 'Put God First', 'Above Inspiration', 'Faith', true),
  ('Q9spMeeBPPY', 'How to Design Your Life''s Blueprint', 'Goalcast', 'Purpose', false),
  ('QMeRKKWLld4', 'Watch This When Nobody Believes In Your Dream', 'The Shift Archives', 'Perseverance', false);

-- ---------- Realtime for the feed ----------
alter publication supabase_realtime add table public.posts, public.comments, public.reactions;
