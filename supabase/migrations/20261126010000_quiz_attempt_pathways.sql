-- Preserve legacy attempts without guessing their pathway. New attempts carry the
-- pathway and an exam-session identifier so retries cannot duplicate results.
alter table public.quiz_attempts
  add column if not exists pathway text,
  add column if not exists exam_session_id uuid;

create unique index if not exists quiz_attempts_user_session_topic_idx
  on public.quiz_attempts (user_id, exam_session_id, topic);
create index if not exists quiz_attempts_user_pathway_created_idx
  on public.quiz_attempts (user_id, pathway, created_at desc);
