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
