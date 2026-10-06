-- Fixes a bootstrap problem: the guard that stops members promoting themselves also
-- blocked the very first admin from ever being created.
--
-- public.is_admin() reads auth.uid(), which is null in trusted contexts: the SQL Editor
-- and anything using the service-role key. The old check therefore refused role changes
-- from exactly the places an owner has to use to appoint the first admin.
--
-- The guard now applies only to changes made by a signed-in member, which is the case
-- it was written for. Trusted server-side contexts are allowed through.

create or replace function public.protect_profile_role()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null          -- a signed-in member, not the SQL editor or server
     and not public.is_admin() then
    raise exception 'Only an admin can change roles';
  end if;
  return new;
end;
$$;

-- Appoint the first admin: replace the address with the first admin's sign-up email.
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'you@example.com');
