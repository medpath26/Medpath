create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  healthcare_program text not null default '',
  role text not null default 'explorer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  certification_goal text not null default 'Certification readiness',
  exam_date date not null default ((now() + interval '30 days')::date),
  weekly_progress integer not null default 0 check (weekly_progress between 0 and 100),
  path_progress integer not null default 0 check (path_progress between 0 and 100),
  streak_days integer not null default 0 check (streak_days >= 0),
  xp integer not null default 0 check (xp >= 0),
  level text not null default 'Orientation',
  next_milestone text not null default 'Fundamentals',
  recommended_topic text not null default 'Medical terminology basics',
  updated_at timestamptz not null default now()
);

alter table public.student_progress
  alter column exam_date set default ((now() + interval '30 days')::date);

create table if not exists public.study_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  due_label text not null,
  minutes integer not null default 15 check (minutes > 0),
  status text not null default 'scheduled' check (status in ('ready', 'in_progress', 'scheduled')),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.recent_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  detail text not null,
  activity_time text not null default 'Today',
  score integer check (score between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null check (category in ('Quiz', 'Flashcards', 'Practice Exam', 'Atlas Tutor')),
  progress integer not null default 0 check (progress between 0 and 100),
  status text not null default 'Start',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

-- Reconcile projects created by earlier schema versions that used "Atlas AI".
-- CREATE TABLE IF NOT EXISTS does not update an existing check constraint.
update public.learning_modules
set category = 'Atlas Tutor'
where category = 'Atlas AI';

alter table public.learning_modules
  drop constraint if exists learning_modules_category_check;
alter table public.learning_modules
  add constraint learning_modules_category_check
  check (category in ('Quiz', 'Flashcards', 'Practice Exam', 'Atlas Tutor'));

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  score integer not null check (score between 0 and 100),
  total_questions integer not null default 0 check (total_questions >= 0),
  correct_answers integer not null default 0 check (correct_answers >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  topic text not null,
  minutes integer not null check (minutes > 0),
  completed_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  email_updates boolean not null default true,
  study_reminders boolean not null default true,
  exam_tracker_hidden boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text not null unique,
  plan text not null check (plan in ('student_plus', 'pro_student', 'founding_member')),
  status text not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.atlas_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null check (char_length(question) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index if not exists study_goals_user_position_idx on public.study_goals (user_id, position);
create index if not exists recent_activity_user_created_idx on public.recent_activity (user_id, created_at desc);
create index if not exists learning_modules_user_position_idx on public.learning_modules (user_id, position);
create index if not exists quiz_attempts_user_created_idx on public.quiz_attempts (user_id, created_at desc);
create index if not exists study_sessions_user_completed_idx on public.study_sessions (user_id, completed_at desc);
create index if not exists atlas_questions_user_created_idx on public.atlas_questions (user_id, created_at desc);

create or replace function public.initialize_medpath_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, healthcare_program, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'healthcare_program', ''),
    'explorer'
  )
  on conflict (id) do nothing;

  insert into public.student_progress (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.study_goals (user_id, title, due_label, minutes, status, position)
  select new.id, seed.title, seed.due_label, seed.minutes, seed.status, seed.position
  from (
    values
      ('Review sterile technique scenarios', 'Today', 25, 'ready', 0),
      ('Complete vital signs flashcards', 'Tomorrow', 15, 'scheduled', 1),
      ('Take a 30-question readiness check', 'Friday', 45, 'in_progress', 2)
  ) as seed(title, due_label, minutes, status, position)
  where not exists (
    select 1 from public.study_goals where user_id = new.id
  );

  insert into public.recent_activity (user_id, title, detail, activity_time, score)
  select new.id, seed.title, seed.detail, seed.activity_time, seed.score
  from (
    values
      ('Account created', 'Your MedPath learning workspace is ready.', 'Today', null::integer),
      ('Atlas ready', 'Ask Atlas for a study plan, explanation, or confidence boost.', 'Today', null::integer),
      ('Path started', 'Your healthcare career journey has begun.', 'Today', null::integer)
  ) as seed(title, detail, activity_time, score)
  where not exists (
    select 1 from public.recent_activity where user_id = new.id
  );

  insert into public.learning_modules (user_id, title, category, progress, status, position)
  select new.id, seed.title, seed.category, seed.progress, seed.status, seed.position
  from (
    values
      ('Medical terminology quiz', 'Quiz', 0, 'Start', 0),
      ('Vital signs flashcards', 'Flashcards', 0, 'Review', 1),
      ('Certification practice exam', 'Practice Exam', 0, 'Start', 2),
      ('Ask Atlas about weak spots', 'Atlas Tutor', 0, 'Open', 3)
  ) as seed(title, category, progress, status, position)
  where not exists (
    select 1 from public.learning_modules where user_id = new.id
  );

  return new;
end;
$$;

revoke all on function public.initialize_medpath_user() from public;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.initialize_medpath_user();

alter table public.profiles enable row level security;
alter table public.student_progress enable row level security;
alter table public.study_goals enable row level security;
alter table public.recent_activity enable row level security;
alter table public.learning_modules enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.study_sessions enable row level security;
alter table public.user_preferences enable row level security;
alter table public.subscriptions enable row level security;
alter table public.atlas_questions enable row level security;

drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Users can read their own progress" on public.student_progress;
drop policy if exists "Users can insert their own progress" on public.student_progress;
drop policy if exists "Users can update their own progress" on public.student_progress;
drop policy if exists "Users can manage their own goals" on public.study_goals;
drop policy if exists "Users can manage their own activity" on public.recent_activity;
drop policy if exists "Users can manage their own modules" on public.learning_modules;
drop policy if exists "Users can manage their own quiz attempts" on public.quiz_attempts;
drop policy if exists "Users can manage their own study sessions" on public.study_sessions;
drop policy if exists "Users can manage their own preferences" on public.user_preferences;
drop policy if exists "Users can read their own subscription" on public.subscriptions;
drop policy if exists "Users can read their own Atlas usage" on public.atlas_questions;
drop policy if exists "Users can record their own Atlas usage" on public.atlas_questions;

create policy "Users can read their own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can read their own progress" on public.student_progress
  for select using (auth.uid() = user_id);
create policy "Users can insert their own progress" on public.student_progress
  for insert with check (auth.uid() = user_id);
create policy "Users can update their own progress" on public.student_progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage their own goals" on public.study_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own activity" on public.recent_activity
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own modules" on public.learning_modules
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own quiz attempts" on public.quiz_attempts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own study sessions" on public.study_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their own preferences" on public.user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can read their own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);
create policy "Users can read their own Atlas usage" on public.atlas_questions
  for select using (auth.uid() = user_id);
create policy "Users can record their own Atlas usage" on public.atlas_questions
  for insert with check (auth.uid() = user_id);

grant select on public.profiles, public.student_progress, public.study_goals,
  public.recent_activity, public.learning_modules, public.quiz_attempts,
  public.study_sessions, public.user_preferences, public.subscriptions,
  public.atlas_questions to authenticated;
grant insert (id, full_name, healthcare_program) on public.profiles to authenticated;
grant insert, update on public.student_progress to authenticated;
grant insert, update, delete on public.study_goals, public.recent_activity,
  public.learning_modules, public.quiz_attempts, public.study_sessions,
  public.user_preferences to authenticated;
grant insert on public.atlas_questions to authenticated;

revoke update on public.profiles from authenticated;
grant update (full_name, healthcare_program, updated_at) on public.profiles to authenticated;

create or replace function public.ensure_medpath_workspace()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_auth_user auth.users%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into current_auth_user from auth.users where id = current_user_id;
  if not found then
    raise exception 'Authenticated user not found';
  end if;

  insert into public.profiles (id, full_name, healthcare_program)
  values (
    current_user_id,
    coalesce(current_auth_user.raw_user_meta_data ->> 'full_name', ''),
    coalesce(current_auth_user.raw_user_meta_data ->> 'healthcare_program', '')
  ) on conflict (id) do nothing;

  insert into public.student_progress (user_id)
  values (current_user_id) on conflict (user_id) do nothing;

  insert into public.user_preferences (user_id)
  values (current_user_id) on conflict (user_id) do nothing;

  insert into public.study_goals (user_id, title, due_label, minutes, status, position)
  select current_user_id, seed.title, seed.due_label, seed.minutes, seed.status, seed.position
  from (values
    ('Review sterile technique scenarios', 'Today', 25, 'ready', 0),
    ('Complete vital signs flashcards', 'Tomorrow', 15, 'scheduled', 1),
    ('Take a 30-question readiness check', 'Friday', 45, 'in_progress', 2)
  ) as seed(title, due_label, minutes, status, position)
  where not exists (select 1 from public.study_goals where user_id = current_user_id);

  insert into public.recent_activity (user_id, title, detail, activity_time, score)
  select current_user_id, seed.title, seed.detail, seed.activity_time, seed.score
  from (values
    ('Account created', 'Your MedPath learning workspace is ready.', 'Today', null::integer),
    ('Atlas ready', 'Ask Atlas for a study plan, explanation, or confidence boost.', 'Today', null::integer),
    ('Path started', 'Your healthcare career journey has begun.', 'Today', null::integer)
  ) as seed(title, detail, activity_time, score)
  where not exists (select 1 from public.recent_activity where user_id = current_user_id);

  insert into public.learning_modules (user_id, title, category, progress, status, position)
  select current_user_id, seed.title, seed.category, seed.progress, seed.status, seed.position
  from (values
    ('Medical terminology quiz', 'Quiz', 0, 'Start', 0),
    ('Vital signs flashcards', 'Flashcards', 0, 'Review', 1),
    ('Certification practice exam', 'Practice Exam', 0, 'Start', 2),
    ('Ask Atlas about weak spots', 'Atlas Tutor', 0, 'Open', 3)
  ) as seed(title, category, progress, status, position)
  where not exists (select 1 from public.learning_modules where user_id = current_user_id);
end;
$$;

revoke all on function public.ensure_medpath_workspace() from public;
grant execute on function public.ensure_medpath_workspace() to authenticated;
