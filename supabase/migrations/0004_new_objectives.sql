-- KOD 0004: guided journal, screen time + focus, custom workouts, savings goals + money
-- reflection, and live chat. Run once in Supabase → SQL Editor after 0001–0003.

-- ---------- Guided journal ----------
-- Three guided prompts sit beside the free-text body. An entry needs at least one of the four.
alter table public.journal_entries alter column body drop not null;
alter table public.journal_entries add column if not exists grateful text;
alter table public.journal_entries add column if not exists proud text;
alter table public.journal_entries add column if not exists kingdom text;
alter table public.journal_entries add constraint journal_entries_has_content
  check (coalesce(body, grateful, proud, kingdom) is not null);

-- ---------- Screen time & focus ----------
-- Members self-report from iPhone Screen Time / Android Digital Wellbeing; a web app cannot read it.
alter table public.profiles add column if not exists screen_time_goal_minutes int not null default 180
  check (screen_time_goal_minutes between 15 and 1440);

create table public.screen_time_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  log_date date not null,
  minutes int not null check (minutes between 0 and 1440),
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  minutes int not null check (minutes between 1 and 240),
  intention text,
  stepped_away int not null default 0,
  completed_on date not null,
  created_at timestamptz not null default now()
);
create index focus_sessions_user_idx on public.focus_sessions (user_id, completed_on desc);

-- ---------- Custom workouts ----------
-- Members build private workouts; mentors can share a workout with every member.
create table public.custom_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  focus text,
  minutes int check (minutes between 1 and 300),
  exercises jsonb not null default '[]'::jsonb,
  shared boolean not null default false,
  created_at timestamptz not null default now()
);
-- Snapshot the title on each log so history survives a deleted custom workout.
alter table public.workout_logs add column if not exists title text;

-- ---------- Money: savings goals, categories, monthly reflection ----------
alter table public.finance_entries add column if not exists category text;

create table public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  saved_amount numeric(12, 2) not null default 0 check (saved_amount >= 0),
  due_date date,
  done_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.finance_reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  month date not null,
  went_well text,
  surprised text,
  change_next text,
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

-- ---------- Live chat: one room for every member, moderated like the feed ----------
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  hidden_at timestamptz,
  hidden_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);
create index chat_messages_created_idx on public.chat_messages (created_at desc);

-- ---------- Row-level security ----------
alter table public.screen_time_logs enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.custom_workouts enable row level security;
alter table public.savings_goals enable row level security;
alter table public.finance_reflections enable row level security;
alter table public.chat_messages enable row level security;

do $$
declare t text;
begin
  foreach t in array array['screen_time_logs','focus_sessions','savings_goals','finance_reflections']
  loop
    execute format('create policy "%1$s owner all" on public.%1$I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end $$;

-- Accountability partners see each other's screen time; that is the point of the partner.
create policy "screen time partner read" on public.screen_time_logs for select to authenticated
  using (public.is_partner_of(user_id));

-- Custom workouts: yours, plus anything a mentor shared. Only mentors may share.
create policy "custom workouts read" on public.custom_workouts for select to authenticated
  using (user_id = auth.uid() or shared);
create policy "custom workouts insert" on public.custom_workouts for insert to authenticated
  with check (user_id = auth.uid() and (not shared or public.is_mentor()));
create policy "custom workouts update" on public.custom_workouts for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and (not shared or public.is_mentor()));
create policy "custom workouts delete" on public.custom_workouts for delete to authenticated
  using (user_id = auth.uid() or (shared and public.is_mentor()));

create policy "chat read" on public.chat_messages for select to authenticated
  using (hidden_at is null or author_id = auth.uid() or public.is_mentor());
create policy "chat insert own" on public.chat_messages for insert to authenticated
  with check (author_id = auth.uid() and hidden_at is null);
create policy "chat mentor update" on public.chat_messages for update to authenticated
  using (public.is_mentor()) with check (public.is_mentor());
create policy "chat delete" on public.chat_messages for delete to authenticated
  using (author_id = auth.uid() or public.is_mentor());

-- ---------- Realtime ----------
alter publication supabase_realtime add table public.chat_messages;
