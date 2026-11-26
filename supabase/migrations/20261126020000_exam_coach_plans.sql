create table if not exists public.exam_coach_plans (
  user_id uuid not null references auth.users(id) on delete cascade,
  pathway text not null check (length(pathway) between 1 and 200),
  exam_date date not null,
  exam_name text not null check (length(exam_name) between 1 and 200),
  weekly_hours integer not null check (weekly_hours between 1 and 30),
  blocks jsonb not null check (jsonb_typeof(blocks) = 'array' and jsonb_array_length(blocks) between 1 and 12),
  completed_weeks integer[] not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, pathway)
);
alter table public.exam_coach_plans enable row level security;
drop policy if exists "Users manage their own exam plans" on public.exam_coach_plans;
create policy "Users manage their own exam plans" on public.exam_coach_plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.exam_coach_plans to authenticated;
