
drop trigger if exists sync_is_super_admin on auth.users;
drop function if exists public.sync_is_super_admin();

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

update auth.users
set is_super_admin = coalesce(raw_app_meta_data ->> 'role', 'user') in ('dev', 'super_admin')
where is_super_admin is null;

update auth.users
set raw_app_meta_data =
  (coalesce(raw_app_meta_data, '{}'::jsonb) - 'role')
  || jsonb_build_object(
       'roles',
       case when raw_app_meta_data ->> 'role' = 'dev'
            then '["user", "dev"]'::jsonb
            else '["user"]'::jsonb end
     )
where not (coalesce(raw_app_meta_data, '{}'::jsonb) ? 'roles');

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

drop function if exists public.admin_list_users();

create or replace function public.admin_list_users()
returns table (
  id uuid,
  email text,
  name text,
  avatar_url text,
  roles jsonb,
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
    coalesce(u.raw_app_meta_data -> 'roles', '["user"]'::jsonb),
    coalesce(u.is_super_admin, false),
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

update auth.users
set phone = null,
    phone_confirmed_at = null
where email = 'fakhiriqbal53@gmail.com'
  and phone = '923001234567';

select email, raw_app_meta_data -> 'roles' as roles, is_super_admin, phone
from auth.users
order by created_at;
