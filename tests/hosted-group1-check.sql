-- Run only against a disposable, isolated Supabase project with all migrations.
-- All sample accounts and data are rolled back, even when the checks succeed.
begin;
insert into auth.users (id, email, raw_user_meta_data) values
 ('00000000-0000-0000-0000-000000000101', 'group1-test-1@example.invalid', '{"healthcare_program":"Medical Assistant"}'),
 ('00000000-0000-0000-0000-000000000102', 'group1-test-2@example.invalid', '{"healthcare_program":"Medical Assistant"}');

-- A user who is not on the prelaunch allowlist cannot access their exam plan.
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000101',true);
do $$ begin
  begin
    insert into public.exam_coach_plans (user_id,pathway,exam_date,exam_name,weekly_hours,blocks)
    values ('00000000-0000-0000-0000-000000000101','Medical Assistant','2027-04-01','Test exam',5,'[{"topic":"Safety"}]');
    raise exception 'Prelaunch insert unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
insert into medpath_private.prelaunch_admins(user_id) values
 ('00000000-0000-0000-0000-000000000101'), ('00000000-0000-0000-0000-000000000102');

set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000101',true);
insert into public.quiz_attempts(user_id,topic,score,total_questions,correct_answers,pathway,exam_session_id)
values ('00000000-0000-0000-0000-000000000101','Safety',50,2,1,'Medical Assistant','10000000-0000-0000-0000-000000000101')
on conflict (user_id,exam_session_id,topic) do nothing;
insert into public.quiz_attempts(user_id,topic,score,total_questions,correct_answers,pathway,exam_session_id)
values ('00000000-0000-0000-0000-000000000101','Safety',50,2,1,'Medical Assistant','10000000-0000-0000-0000-000000000101')
on conflict (user_id,exam_session_id,topic) do nothing;
insert into public.exam_coach_plans (user_id,pathway,exam_date,exam_name,weekly_hours,blocks)
values ('00000000-0000-0000-0000-000000000101','Medical Assistant','2027-04-01','Test exam',5,'[{"topic":"Safety"}]');
do $$ begin
  if (select count(*) from public.quiz_attempts) <> 1 then raise exception 'Attempt retry was not deduplicated'; end if;
  if (select count(*) from public.exam_coach_plans) <> 1 then raise exception 'Owner cannot see exam plan'; end if;
  begin
    perform public.reserve_atlas_tutor_question('00000000-0000-0000-0000-000000000101');
    raise exception 'Client could reserve quota directly';
  exception when insufficient_privilege then null;
  end;
end $$;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-000000000102',true);
do $$ begin
  if (select count(*) from public.quiz_attempts) <> 0 then raise exception 'Another user can see quiz attempts'; end if;
  if (select count(*) from public.exam_coach_plans) <> 0 then raise exception 'Another user can see exam plans'; end if;
end $$;
reset role;
set local role service_role;
do $$ declare uid uuid := '00000000-0000-0000-0000-000000000101'; begin
  if public.reserve_atlas_tutor_question(uid) <> 'ok' then raise exception 'Tutor reservation failed'; end if;
  if public.reserve_atlas_generation(uid,2) <> 'ok' then raise exception 'Generation reservation failed'; end if;
  if public.reserve_atlas_tutor_question(uid) <> 'ok' then raise exception 'Second tutor reservation failed'; end if;
  if public.reserve_atlas_generation(uid,2) <> 'limit' then raise exception 'Shared free limit was not enforced'; end if;
end $$;
reset role;
rollback;
select 'Group 1 isolation and shared limits passed; synthetic data rolled back' as result;
