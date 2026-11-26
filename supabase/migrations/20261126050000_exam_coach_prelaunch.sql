-- Exam plans were added after the prelaunch policies in the earlier migration.
-- Apply the same restrictive gate to direct API access to this new table.
create policy prelaunch_access on public.exam_coach_plans
  as restrictive for all to anon, authenticated
  using ((select medpath_private.prelaunch_access_allowed()))
  with check ((select medpath_private.prelaunch_access_allowed()));
