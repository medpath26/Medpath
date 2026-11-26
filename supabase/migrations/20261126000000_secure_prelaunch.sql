create schema if not exists medpath_private;
revoke all on schema medpath_private from public, anon, authenticated;

create table medpath_private.prelaunch_release (
  singleton boolean primary key default true check (singleton),
  approved_at timestamptz check (approved_at >= timestamptz '2027-02-01 05:00:00+00')
);

insert into medpath_private.prelaunch_release (singleton) values (true);

create function medpath_private.enforce_release_approval_time()
returns trigger
language plpgsql set search_path = ''
as $$
begin
  if new.approved_at is not null and (
    statement_timestamp() < timestamptz '2027-02-01 05:00:00+00'
    or new.approved_at > statement_timestamp()
  ) then
    raise exception 'Launch approval must be given on or after the scheduled launch.';
  end if;
  return new;
end;
$$;

create trigger enforce_release_approval_time
before insert or update on medpath_private.prelaunch_release
for each row execute function medpath_private.enforce_release_approval_time();

create table medpath_private.prelaunch_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- Restrictive policies also apply to previously issued student JWTs.
-- The existing ownership policies must still authorize each operation.
create function public.medpath_public_access_open()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from medpath_private.prelaunch_release
    where approved_at <= statement_timestamp()
      and statement_timestamp() >= timestamptz '2027-02-01 05:00:00+00'
  );
$$;

revoke all on function public.medpath_public_access_open() from public, anon, authenticated;
grant execute on function public.medpath_public_access_open() to service_role;

create function medpath_private.prelaunch_access_allowed()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select public.medpath_public_access_open() or exists (
    select 1 from medpath_private.prelaunch_admins where user_id = auth.uid()
  );
$$;

revoke all on function medpath_private.prelaunch_access_allowed() from public;
grant execute on function medpath_private.prelaunch_access_allowed() to anon, authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles', 'student_progress', 'study_goals', 'recent_activity',
    'learning_modules', 'quiz_attempts', 'study_sessions', 'user_preferences',
    'subscriptions', 'atlas_questions', 'pathway_progress'
  ] loop
    execute format(
      'create policy prelaunch_access on public.%I as restrictive for all to anon, authenticated using ((select medpath_private.prelaunch_access_allowed())) with check ((select medpath_private.prelaunch_access_allowed()))',
      table_name
    );
  end loop;
end
$$;

create function medpath_private.prelaunch_before_user_created(event jsonb)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  if public.medpath_public_access_open() then return '{}'::jsonb; end if;
  return jsonb_build_object('error', jsonb_build_object('http_code', 403, 'message', 'Registration is closed.'));
end;
$$;

create function medpath_private.prelaunch_access_token(event jsonb)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
begin
  if public.medpath_public_access_open() or exists (
    select 1 from medpath_private.prelaunch_admins where user_id = (event->>'user_id')::uuid
  ) then return event; end if;
  return jsonb_build_object('error', jsonb_build_object('http_code', 403, 'message', 'Authentication is closed.'));
end;
$$;

revoke all on function medpath_private.prelaunch_before_user_created(jsonb) from public;
revoke all on function medpath_private.prelaunch_access_token(jsonb) from public;
grant usage on schema medpath_private to supabase_auth_admin;
grant execute on function medpath_private.prelaunch_before_user_created(jsonb) to supabase_auth_admin;
grant execute on function medpath_private.prelaunch_access_token(jsonb) to supabase_auth_admin;

create table public.prelaunch_waitlist (
  email text primary key check (
    email = lower(btrim(email)) and char_length(email) <= 254
    and email ~ '^[^[:space:]@]+@[^[:space:]@.]+(\.[^[:space:]@.]+)+$'
  ),
  consent_version text not null check (char_length(consent_version) > 0),
  consented_at timestamptz not null default now()
);

alter table public.prelaunch_waitlist enable row level security;
revoke all on public.prelaunch_waitlist from public, anon, authenticated, service_role;
grant insert on public.prelaunch_waitlist to service_role;

-- The existing workspace bootstrap uses SECURITY DEFINER and bypasses RLS.
alter function public.ensure_medpath_workspace() set schema medpath_private;
revoke all on function medpath_private.ensure_medpath_workspace() from public, anon, authenticated;

create function public.ensure_medpath_workspace()
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not medpath_private.prelaunch_access_allowed() then
    raise exception 'Workspace access is closed.' using errcode = '42501';
  end if;
  perform medpath_private.ensure_medpath_workspace();
end;
$$;

revoke all on function public.ensure_medpath_workspace() from public, anon, authenticated;
grant execute on function public.ensure_medpath_workspace() to authenticated;

-- Optional hosted Send Email hook for suppressing direct Auth recovery and OTP email.
-- Remove the hook at launch to resume the existing Supabase email provider.
create function medpath_private.prelaunch_auth_email(event jsonb)
returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object('error', jsonb_build_object('http_code', 403, 'message', 'Authentication email is closed.'));
$$;

revoke all on function medpath_private.prelaunch_auth_email(jsonb) from public;
grant execute on function medpath_private.prelaunch_auth_email(jsonb) to supabase_auth_admin;
