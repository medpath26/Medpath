# MedPath

Modern SaaS prototype for MedPath, a healthcare career operating system for Medical Assistant and Surgical Technology students.

## What is included

- Next.js app router interface with mobile-first responsive design
- Landing page, authentication flows, dashboard, Atlas mentor, study plans, practice questions, clinical prep, career explorer, resume builder, interview coach, billing, and admin panel
- Role-based access control model for Explorer, Student Plus, Pro Student, Founding Member, Institution, and Administrator roles
- Premium feature locks with upgrade overlay
- Stripe Checkout and webhook route stubs with signature verification
- Supabase Auth and per-user dashboard persistence for profiles, progress, goals, activity, modules, quiz attempts, and study sessions
- Generated healthcare education hero artwork in `public/medpath-hero.png`

## Run locally

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and add Supabase/Stripe credentials when you are ready to connect live services.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor and run `supabase/schema.sql`.
3. Add these values to `.env.local` and to your hosting provider:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

The app uses Supabase Auth for sign up, login, logout, and password reset. After login it creates or loads the user's `profiles`, `student_progress`, `study_goals`, `recent_activity`, `learning_modules`, `quiz_attempts`, and `study_sessions` rows under row-level security.

## Production integration notes

- Store users in Supabase Auth and user profile rows in the `profiles` table.
- Store subscription status in a `subscriptions` table keyed by Supabase user ID and Stripe customer ID.
- Update `profiles.role` only from verified Stripe webhooks.
- Use the `planAccess` map in `lib/medpath-data.ts` as the source of truth for feature gating.
- Institution features are modeled but intentionally hidden from public pricing.

## Secure prelaunch

The launch threshold is **February 1, 2027 at 12:00 AM Eastern** (05:00 UTC).
The public hostname serves the coming-soon page until both the deployment flag
and the database approval allow the release. Passing the launch time alone
keeps the gate closed. Missing or invalid configuration also keeps it closed.

### Configure before deploying

1. Apply the Supabase migrations in order to an isolated test project first.
   Use the Supabase migration history for an existing project and apply
   `20261126000000_secure_prelaunch.sql` after its prerequisites. The new
   waitlist table accepts service-role inserts. Database administrators can
   manage consent records through the SQL editor. Keep service credentials in
   server-side environment variables.
2. On the public deployment set `PRELAUNCH_MODE=true`,
   `PRELAUNCH_PUBLIC_HOST` to the exact canonical hostname without a scheme,
   and `PRELAUNCH_PREVIEW=false`. Configure any aliases to redirect to that
   hostname at the hosting layer. Route requests through Next.js middleware,
   including static assets and RSC requests. Remove or restrict older live
   deployment URLs and purge any cached application responses.
3. Enable provider-level deployment protection on every preview and alternate
   deployment URL before exposing it. On preview deployments set
   `PRELAUNCH_PREVIEW=true`, leave `PRELAUNCH_PUBLIC_HOST` unset, and use
   an isolated Supabase project and Stripe test credentials. Use a test
   webhook secret for preview work. Do not copy production service keys to previews.
4. Generate two distinct secrets per environment with `openssl rand -hex 32`.
   Set `PRELAUNCH_ADMIN_TOKEN` and `PRELAUNCH_SESSION_SECRET` through the
   provider's secret settings. Share the admin token through the team's secret
   manager. On a protected preview, open `/` and submit the token. To access
   the app on the public hostname, post an URL-encoded `token` field to
   `/api/prelaunch/session` from that same origin using an approved admin
   client. The host-bound cookie expires after four hours. Clearing it ends the
   browser session. Rotating either secret invalidates all access cookies.
   App login and Supabase permissions still apply behind the deployment gate.
5. In hosted Supabase Auth, enable the **Before User Created** and **Custom
   Access Token** hooks from `supabase/config.toml`. Add existing,
   administrator-controlled Supabase user IDs to
   `medpath_private.prelaunch_admins` via the SQL editor. The allowlist is
   separate from the application profile role. If the hosted project exposes
   direct Auth routes, configure the **Send Email** hook to
   `pg-functions://postgres/medpath_private/prelaunch_auth_email` to suppress
   public recovery and OTP email during prelaunch. Hosted hook availability
   depends on the Supabase plan. Verify signup, sign-in, recovery and token
   refresh directly against hosted Auth as well as through the application.
   Review previously issued sessions and any independently deployed Supabase
   functions or gateways. If the hosted project cannot enforce these controls,
   keep its public Auth ingress restricted through the hosting setup before
   treating the release as protected.
6. Add provider rate limits to `POST /api/prelaunch/waitlist` and
   `POST /api/prelaunch/session`. Confirm there are no active public Stripe
   Payment Links or previously created open Checkout sessions for the platform.
   The app blocks live checkout and portal creation before approval. Keep
   the existing signed production webhook working for subscription synchronization.

### Pre-deployment checks

- On the public hostname confirm the countdown, one Atlas image, the Founding
  Member announcement, and the social image. Use narrow and wide viewports.
- As a visitor, request existing app pages, deep links, authentication callbacks,
  app JS chunks, RSC responses and Stripe routes directly. Verify access is
  denied. Verify the unsigned Stripe webhook request is rejected and verify
  a signed test webhook in an isolated test environment.
- Repeat on every preview URL without provider authorization. On an authorized
  preview, check that invalid app access tokens fail and that an administrator
  can open the app and use its normal sign-in flow. Check Supabase with both
  an administrator and an existing student token while locked.
- Submit the waitlist with and without consent, a malformed email, and the
  same valid email with different casing. Verify the accepted attempts show
  the same response and there is exactly one timestamped consent record.
  Verify public and authenticated Supabase roles cannot read or write it.
- Verify missing configuration, database failure, early approval and an
  unapproved launch after the threshold all keep the gate closed. Exercise
  the approved transition on an isolated environment with the clock or
  launch threshold adjusted solely for that test.

### Approve the public launch

At or after the threshold an authorized database administrator must run this
statement in the production Supabase SQL editor:

```sql
update medpath_private.prelaunch_release
set approved_at = statement_timestamp()
where singleton and approved_at is null;
```

The database rejects approvals made ahead of the launch threshold. Set
`PRELAUNCH_MODE=false` on the canonical production deployment and redeploy if
the host snapshots environment settings per deployment. Remove the temporary
Send Email hook, if enabled, to restore the previously configured messaging
provider. Leave preview protection in place. Verify the original homepage,
auth and subscription paths against production after the transition. The two
database access hooks pass through once the approval is effective.

To close access again, set `PRELAUNCH_MODE=true` and clear
`medpath_private.prelaunch_release.approved_at` in the SQL editor. Reapply
prelaunch Auth email controls and purge cached application responses. Use both
controls because already issued Supabase tokens can reach the Data API directly.

## Group 1 study generation (draft)

Atlas study-material generation is disabled unless `ATLAS_GENERATION_ENABLED=true`,
`ATLAS_GENERATION_MODEL` is set to an available Responses API model,
`ATLAS_GENERATION_PAID_DAILY_LIMIT` is an integer from 1 to 100, and server-only
`OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are configured. Never use
`NEXT_PUBLIC_` for service keys. Apply the Group 1 migrations only to an isolated
test project first. Preview deployments must use a separate Supabase project,
non-production AI credentials and provider-level preview protection.

The feature sends the learner's confirmed notes to OpenAI for generation and
requests no API-side response storage. It does not save notes or generated content
in Supabase. The warning against identifiable patient information is not an
automatic detector; review privacy and clinical safety requirements before enabling.
Free generation shares the existing three-question Atlas counter. Paid generation
has a configurable daily safety limit; reserved attempts count even if the provider
fails. Review those limits and make product copy consistent before release. The tutor and generation share a server-side reservation lock. Apply the tutor
reservation migration and deploy its matching application code together; older
clients that insert usage directly will need to reload. Keep generation disabled
until all hosted account, quota, privacy and provider failure tests have passed.

Automatic Vercel deployments are disabled for the Group 1 feature branch while
its migrations and provider configuration await review. This preserves the
existing preview. Remove the branch-specific setting in `vercel.json` when an
isolated preview is ready to be deployed and tested; it does not disable main.
