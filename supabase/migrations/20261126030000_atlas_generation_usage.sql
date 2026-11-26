-- Counters contain no note contents. Only the server's service role can reserve usage.
create table if not exists public.atlas_generation_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null,
  requests integer not null default 0 check (requests >= 0),
  primary key (user_id, usage_day)
);
alter table public.atlas_generation_usage enable row level security;
revoke all on public.atlas_generation_usage from public, anon, authenticated;

create or replace function public.reserve_atlas_generation(p_user_id uuid, p_paid_daily_limit integer)
returns text language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  account_role text;
  used_today integer;
  used_free bigint;
  current_day date := (now() at time zone 'UTC')::date;
begin
  if p_user_id is null or p_paid_daily_limit is null or p_paid_daily_limit < 1 or p_paid_daily_limit > 100 then return 'unavailable'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  select role into account_role from public.profiles where id = p_user_id;
  if account_role is null or account_role not in ('explorer','student_plus','pro_student','founding_member','institution_student','institution_admin','administrator') then return 'denied'; end if;
  if account_role = 'explorer' then
    select count(*) into used_free from public.atlas_questions where user_id = p_user_id;
    if used_free >= 3 then return 'limit'; end if;
    -- Uses the same free Atlas counter as the existing tutor without saving notes.
    insert into public.atlas_questions (user_id, question) values (p_user_id, 'Study material generation');
  else
    select requests into used_today from public.atlas_generation_usage where user_id = p_user_id and usage_day = current_day;
    if coalesce(used_today,0) >= p_paid_daily_limit then return 'limit'; end if;
  end if;
  insert into public.atlas_generation_usage (user_id, usage_day, requests) values (p_user_id, current_day, 1)
  on conflict (user_id, usage_day) do update set requests = public.atlas_generation_usage.requests + 1;
  return 'ok';
end $$;
revoke all on function public.reserve_atlas_generation(uuid, integer) from public, anon, authenticated;
grant execute on function public.reserve_atlas_generation(uuid, integer) to service_role;
