import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// This is a minimal local Supabase-shaped database, not a replacement for hosted integration tests.
test('Group 1 migrations isolate user data and protect quota reservations', async () => {
  const db = new PGlite();
  try {
    await db.exec(`
      create role anon nologin; create role authenticated nologin; create role service_role nologin;
      create schema auth;
      create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to authenticated;
      grant execute on function auth.uid() to authenticated;
      insert into auth.users values ('00000000-0000-0000-0000-000000000001'), ('00000000-0000-0000-0000-000000000002');
      create table public.profiles(id uuid primary key, role text not null);
      insert into public.profiles values ('00000000-0000-0000-0000-000000000001','explorer'), ('00000000-0000-0000-0000-000000000002','pro_student');
      create table public.atlas_questions(id bigint generated always as identity, user_id uuid not null, question text not null);
      create table public.quiz_attempts(id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id), topic text not null, score integer not null check(score between 0 and 100), total_questions integer not null default 0, correct_answers integer not null default 0, created_at timestamptz not null default now());
      alter table public.quiz_attempts enable row level security;
      create policy own_attempts on public.quiz_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
      grant select,insert,update,delete on public.quiz_attempts to authenticated;
    `);
    for (const file of ['20261126010000_quiz_attempt_pathways.sql', '20261126020000_exam_coach_plans.sql', '20261126030000_atlas_generation_usage.sql']) {
      await db.exec(await readFile(`supabase/migrations/${file}`, 'utf8'));
    }
    const first = '00000000-0000-0000-0000-000000000001', second = '00000000-0000-0000-0000-000000000002';
    await db.exec(`set role authenticated; set request.jwt.claim.sub = '${first}';`);
    const attempt = `insert into quiz_attempts(user_id,topic,score,total_questions,correct_answers,pathway,exam_session_id) values ('${first}','Safety',50,2,1,'Medical Assistant','10000000-0000-0000-0000-000000000001') on conflict (user_id,exam_session_id,topic) do nothing`;
    await db.exec(attempt); await db.exec(attempt);
    assert.equal((await db.query('select * from quiz_attempts')).rows.length, 1);
    await db.exec(`insert into exam_coach_plans(user_id,pathway,exam_date,exam_name,weekly_hours,blocks) values ('${first}','Medical Assistant','2027-04-01','Exam',5,'[{"start":"2027-03-01","topic":"Safety"}]')`);
    await db.exec(`set request.jwt.claim.sub = '${second}';`);
    assert.equal((await db.query('select * from quiz_attempts')).rows.length, 0);
    assert.equal((await db.query('select * from exam_coach_plans')).rows.length, 0);
    await assert.rejects(db.exec(`insert into exam_coach_plans(user_id,pathway,exam_date,exam_name,weekly_hours,blocks) values ('${first}','Other','2027-04-01','Exam',5,'[{"start":"2027-03-01","topic":"Safety"}]')`));
    await assert.rejects(db.query('select public.reserve_atlas_generation($1, $2)', [first, 2]));
    await db.exec('reset role; set role service_role');
    assert.equal((await db.query('select public.reserve_atlas_generation($1, $2) as value', [first, null])).rows[0].value, 'unavailable');
    const reserve = async user => (await db.query('select public.reserve_atlas_generation($1, $2) as value', [user, 2])).rows[0].value;
    assert.deepEqual([await reserve(first),await reserve(first),await reserve(first),await reserve(first)], ['ok','ok','ok','limit']);
    assert.deepEqual([await reserve(second),await reserve(second),await reserve(second)], ['ok','ok','limit']);
  } finally { await db.close(); }
});
