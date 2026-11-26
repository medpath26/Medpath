# Repository guidance

- MedPath uses the Next.js App Router, shared client components in `components/MedPathComponents.tsx`, Supabase Auth and row-level security, and Stripe server routes. Keep service credentials server-side.
- Preserve `lib/prelaunch.ts`, `middleware.ts`, the prelaunch migration and the documented February 1, 2027 release approval requirements. Never merge or deploy Group 1 without review.
- Check `lib/medpath-data.ts` for existing plan permissions before changing access. Protect user data with server authorization and appropriate RLS; use additive migrations.
- Atlas currently uses local rule-based responses in `app/page.tsx`; do not describe it as an AI integration or invent capabilities. Validate educational material and avoid claims of certification or mastery.
- Run `pnpm build` and relevant targeted tests; document environment-dependent checks and incomplete features in the pull request.
