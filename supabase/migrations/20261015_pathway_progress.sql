-- MedPath: isolated learning progress for each student and career pathway.
-- Apply through the reviewed Supabase migration workflow before enabling switching.
-- Existing student_progress and profile records remain untouched.
create table if not exists public.pathway_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  pathway text not null check (length(trim(pathway)) > 0),
  progress_data jsonb not null default '{}'::jsonb
    check (jsonb_typeof(progress_data) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (user_id, pathway)
);

create index if not exists pathway_progress_user_updated_idx
  on public.pathway_progress (user_id, updated_at desc);

alter table public.pathway_progress enable row level security;

create policy "Students can read their own pathway progress"
  on public.pathway_progress for select to authenticated
  using (auth.uid() = user_id);

create policy "Students can create their own pathway progress"
  on public.pathway_progress for insert to authenticated
  with check (auth.uid() = user_id);

create policy "Students can update their own pathway progress"
  on public.pathway_progress for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Students can delete their own pathway progress"
  on public.pathway_progress for delete to authenticated
  using (auth.uid() = user_id);

comment on table public.pathway_progress is
  'Per-user, per-career-path progress snapshots; switching paths must never overwrite another path.';
