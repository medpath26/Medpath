# MedPath AI

Modern SaaS prototype for MedPath AI, a healthcare career operating system for Medical Assistant and Surgical Technology students.

## What is included

- Next.js app router interface with mobile-first responsive design
- Landing page, authentication flows, dashboard, Atlas mentor, study plans, practice questions, clinical prep, career explorer, resume builder, interview coach, billing, and admin panel
- Role-based access control model for Explorer, Student Plus, Pro Student, Founding Member, Institution, and Administrator roles
- Premium feature locks with upgrade overlay
- Stripe Checkout and webhook route stubs with signature verification
- Supabase-ready data boundaries via env configuration and role/profile concepts
- Generated healthcare education hero artwork in `public/medpath-hero.png`

## Run locally

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and add Supabase/Stripe credentials when you are ready to connect live services.

## Production integration notes

- Store users in Supabase Auth and user profile rows in a `profiles` table.
- Store subscription status in a `subscriptions` table keyed by Supabase user ID and Stripe customer ID.
- Update `profiles.role` only from verified Stripe webhooks.
- Use the `planAccess` map in `lib/medpath-data.ts` as the source of truth for feature gating.
- Institution features are modeled but intentionally hidden from public pricing.
