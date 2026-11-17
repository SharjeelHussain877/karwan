-- DadSmith auth setup: the one migration to run.
-- Supabase dashboard -> SQL Editor -> paste this whole file -> Run.
-- Safe to run more than once.
--
-- Supabase's Admin API can neither read nor write auth.users.is_super_admin, so the
-- backend reaches it through the small functions below. They can only be called
-- with the service role key (the backend's secret key), never from a browser.
--
--   1. is_super_admin is never null: new users get false.
--   2. Existing users are filled in once: dev / super_admin -> true, others false.
--      After that the flag is toggled from the Users page, independent of the role.
--   3. admin_get_is_super_admin / admin_list_users / admin_set_is_super_admin.
--   4. Removes the test phone number saved on the dev account while testing
--      (the Admin API can set a phone but not clear it).

-- Older version of this migration: a trigger that derived the flag from the role.
drop trigger if exists sync_is_super_admin on auth.users;
drop function if exists public.sync_is_super_admin();

-- 1. Never null -------------------------------------------------------------

create or replace function public.default_is_super_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.is_super_admin := coalesce(new.is_super_admin, false);
  return new;
end;
$$;

revoke all on function public.default_is_super_admin() from public, anon, authenticated;

drop trigger if exists default_is_super_admin on auth.users;

create trigger default_is_super_admin
  before insert on auth.users
  for each row execute function public.default_is_super_admin();

-- 2. Fill in existing users (only the ones still null) -----------------------

update auth.users
set is_super_admin = coalesce(raw_app_meta_data ->> 'role', 'user') in ('dev', 'super_admin')
where is_super_admin is null;

-- 3. Functions used by the backend ------------------------------------------

create or replace function public.admin_get_is_super_admin(target uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select coalesce(
    (select u.is_super_admin from auth.users u where u.id = target),
    false
  );
$$;

-- The result columns changed, so the function is dropped first.
drop function if exists public.admin_list_users();

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  name text,
  avatar_url text,
  role text,
  is_super_admin boolean,
  is_active boolean,
  created_at timestamptz
)
language sql
security definer
set search_path = ''
as $$
  select
    u.id,
    u.email::text,
    coalesce(u.raw_user_meta_data ->> 'name', ''),
    coalesce(u.raw_user_meta_data ->> 'avatar_url', ''),
    coalesce(u.raw_app_meta_data ->> 'role', 'user'),
    coalesce(u.is_super_admin, false),
    -- Active = not banned. The toggle on the Users page sets or clears banned_until.
    (u.banned_until is null or u.banned_until <= now()),
    u.created_at
  from auth.users u
  where u.deleted_at is null
  order by u.created_at;
$$;

create or replace function public.admin_set_is_super_admin(target uuid, value boolean)
returns void
language sql
security definer
set search_path = ''
as $$
  update auth.users set is_super_admin = value where id = target;
$$;

revoke all on function public.admin_get_is_super_admin(uuid) from public, anon, authenticated;
revoke all on function public.admin_list_users() from public, anon, authenticated;
revoke all on function public.admin_set_is_super_admin(uuid, boolean) from public, anon, authenticated;

grant execute on function public.admin_get_is_super_admin(uuid) to service_role;
grant execute on function public.admin_list_users() to service_role;
grant execute on function public.admin_set_is_super_admin(uuid, boolean) to service_role;

-- 4. Test phone cleanup (only the exact number used in testing) --------------

update auth.users
set phone = null,
    phone_confirmed_at = null
where email = 'fakhiriqbal53@gmail.com'
  and phone = '923001234567';

-- Result: check it after running.
select email, raw_app_meta_data ->> 'role' as role, is_super_admin, phone
from auth.users
order by created_at;
