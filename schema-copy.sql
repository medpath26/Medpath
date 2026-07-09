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
  category text not null check (category in ('Quiz', 'Flashcards', 'Practice Exam', 'Atlas AI')),
  progress integer not null default 0 check (progress between 0 and 100),
  status text not null default 'Start',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

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

alter table public.profiles enable row level security;
alter table public.student_progress enable row level security;
alter table public.study_goals enable row level security;
alter table public.recent_activity enable row level security;
alter table public.learning_modules enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.study_sessions enable row level security;

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
