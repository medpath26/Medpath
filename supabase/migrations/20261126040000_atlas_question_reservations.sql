-- Reserve free tutor usage on the server under the same lock as generation.
-- Store a marker only; the learner's question is not persisted here.
create or replace function public.reserve_atlas_tutor_question(p_user_id uuid)
returns text language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  account_role text;
  used_free bigint;
begin
  if p_user_id is null then return 'denied'; end if;
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 0));
  select role into account_role from public.profiles where id = p_user_id;
  if account_role is null or account_role not in ('explorer','student_plus','pro_student','founding_member','institution_student','institution_admin','administrator') then return 'denied'; end if;
  if account_role = 'explorer' then
    select count(*) into used_free from public.atlas_questions where user_id = p_user_id;
    if used_free >= 3 then return 'limit'; end if;
    insert into public.atlas_questions (user_id, question) values (p_user_id, 'Atlas tutor question');
  end if;
  return 'ok';
end $$;
revoke all on function public.reserve_atlas_tutor_question(uuid) from public, anon, authenticated;
grant execute on function public.reserve_atlas_tutor_question(uuid) to service_role;
-- Prevent direct client inserts from bypassing the shared reservation lock.
revoke insert on public.atlas_questions from authenticated;
drop policy if exists "Users can record their own Atlas usage" on public.atlas_questions;
