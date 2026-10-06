-- Invite codes: new members must enter a valid code to create an account.
-- Run this in Supabase -> SQL Editor after 0001_init.sql.

create table if not exists public.invite_codes (
  code text primary key,
  label text,
  created_by uuid references public.profiles (id) on delete set null,
  max_uses int check (max_uses is null or max_uses > 0),  -- null = unlimited
  uses int not null default 0,
  expires_at timestamptz,                                  -- null = never expires
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.invite_codes enable row level security;

-- Only mentors and admins can see or manage codes. Nobody else can read the list,
-- which is why sign-up checks a code through the two functions below instead.
create policy "invite codes mentor read" on public.invite_codes
  for select to authenticated using (public.is_mentor());
create policy "invite codes mentor write" on public.invite_codes
  for all to authenticated using (public.is_mentor()) with check (public.is_mentor());

/*
  Answers "is this code usable right now?" without revealing any other code.
  Security definer so it can read the table while the caller cannot.
*/
create or replace function public.validate_invite_code(p_code text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.invite_codes
    where upper(code) = upper(btrim(p_code))
      and active
      and (expires_at is null or expires_at > now())
      and (max_uses is null or uses < max_uses)
  );
$$;

/* Records one use. Called after the account is actually created. */
create or replace function public.consume_invite_code(p_code text)
returns void
language sql security definer set search_path = public as $$
  update public.invite_codes
  set uses = uses + 1
  where upper(code) = upper(btrim(p_code))
    and active
    and (expires_at is null or expires_at > now())
    and (max_uses is null or uses < max_uses);
$$;

revoke all on function public.validate_invite_code(text) from public;
revoke all on function public.consume_invite_code(text) from public;
grant execute on function public.validate_invite_code(text) to anon, authenticated;
grant execute on function public.consume_invite_code(text) to anon, authenticated;

-- A starting code so sign-up keeps working the moment this runs.
-- Change or revoke it from Me -> Mentor tools -> Invite codes.
insert into public.invite_codes (code, label)
values ('KOD2026', 'Starter code')
on conflict (code) do nothing;
