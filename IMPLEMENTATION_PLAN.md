# Implementation Plan (`IMPLEMENTATION_PLAN.md`): ASAP MVP

- **Document Version:** 1.0 (Trackable Master Build Plan)
- **Product Name:** ASAP
- **Platform:** Progressive Web App (PWA)
- **Coverage:** All 36 states of Nigeria (+ FCT)
- **Approved Tech Stack:** Next.js (App Router, TypeScript), Tailwind CSS, Supabase (PostgreSQL, Auth, Storage), Paystack (₦1,000/month subscriptions), OpenRouter (Free AI helper)
- **Primary Rules:** Email OTP, zero-cost live selfie + valid ID capture, 1-month free trial for service providers, ₦1,000/month Paystack renewal, zero grace period (immediate contact auto-hide on expiration), top navigation bar, dual-theme tokens.

---

## 1. Sequential Phase Strategy Summary

1. **Phase 0: Project Initialization**
   Repository setup, `.env` configuration, approved dependencies, tooling, and PWA base assets.
2. **Phase 1: Database & Data Access Layer**
   PostgreSQL/Supabase schema migrations, Row-Level Security (RLS) policies, private storage buckets, seed data, and service/data-access layer (`src/services/**`, `src/lib/**`, `src/types/**`).
3. **Phase 2: Core API & Auth Foundations**
   Email OTP authentication helpers, route guards/middleware, contact sanitizer (enforcing zero grace period), and core backend API route handlers.
4. **Phase 3: Onboarding, Identity Capture & 1-Month Free Trial**
   Welcome screen, email OTP sign-up/login, role selection, zero-cost live selfie + valid ID capture, and automatic 1-month free trial activation for service providers.
5. **Phase 4: 36-State Location Search, Star Ratings & Direct Contact**
   Nigerian 36-state location picker, service category & star rating ranking, gated Call/WhatsApp contact actions, ratings, and report/block safety controls.
6. **Phase 5: Paystack Monthly Subscription (₦1,000/Month) & Zero-Grace Enforcement**
   Paystack checkout initialization, webhook signature verification & idempotency, subscription status view, and automatic expiration/contact hiding with zero grace period.
7. **Phase 6: Optional AI Helper (`P1`) & Admin Moderation (`P1`)**
   Free-tier OpenRouter AI bio/category helper with fallback, plus `/admin` report/identity/subscription oversight view.
8. **Final Phase: Polish & QA**
   Loading skeletons, empty/error states, dual-theme/responsive/a11y checks, unit/integration/E2E tests, and production deployment preparation.

---

## 2. Phase-by-Phase Detailed Master Checklist

### Phase 0: Project Initialization

- **Phase Goal:** Establish a rock-solid, type-safe Next.js PWA project foundation with approved dependencies, directory skeleton, validated environment configuration, design system tokens, and PWA assets.
- **Prerequisites / Dependencies:** Node.js v20+ / v24+, npm / pnpm.
- **Database / API Changes:** None.
- **Target Files / Modules:**
  - `package.json`
  - `tsconfig.json`
  - `next.config.ts`
  - `.gitignore`
  - `.env.example`
  - `src/lib/env.ts`
  - `tailwind.config.ts`
  - `src/app/globals.css`
  - `public/manifest.json`
  - `public/sw.js`
  - `public/offline.html`
  - `public/icons/**`
  - `src/components/layout/pwa-register.tsx`
- **Actionable Tasks:**
  - [x] **Task 0.1:** Initialize project repository and `package.json` with approved core dependencies (`next`, `react`, `react-dom`, `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `tailwindcss`, `postcss`, `autoprefixer`, `@supabase/supabase-js`, `@supabase/ssr`, `zod`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `date-fns`), base configuration files (`tsconfig.json`, `next.config.ts`, `.gitignore`), and scaffold directory skeleton (`src/app/`, `src/components/`, `src/services/`, `src/lib/`, `src/types/`, `public/`, `tests/`).
  - [x] **Task 0.2:** Create `.env.example` blueprint and `src/lib/env.ts` with strict Zod validation schema for client (`NEXT_PUBLIC_*`) and server-only secrets (`SUPABASE_SERVICE_ROLE_KEY`, `PAYSTACK_SECRET_KEY`, etc.).
  - [x] **Task 0.3:** Configure `tailwind.config.ts` and `src/app/globals.css` with adaptive dual-theme slate/trust teal tokens, typography scale, radii, and tap target rules from `DESIGN.md`.
  - [x] **Task 0.4:** Set up PWA base assets: `public/manifest.json`, `public/sw.js`, `public/offline.html`, placeholder icons in `public/icons/`, and client register component `src/components/layout/pwa-register.tsx`.
- **Testing & Completion Criteria:**
  - `package.json` contains only approved dependencies without banned packages (no paid biometric SDKs, no extra icon packs, no redundant ORMs).
  - TypeScript compilation passes (`npx tsc --noEmit`).
  - Next.js development server starts cleanly.
  - Manifest is valid JSON and linked in document headers.

---

### Phase 1: Database & Data Access Layer

- **Phase Goal:** Create and verify the complete Supabase PostgreSQL schema, Row-Level Security (RLS) policies, private storage buckets, Nigerian states/categories constants, TypeScript definitions, and data-access service foundations.
- **Prerequisites / Dependencies:** Phase 0 complete; Supabase connection / migration tools.
- **Database / API Changes:**
  - Tables: `users`, `identity_records`, `provider_profiles`, `subscriptions`, `payment_events`, `ratings`, `reports`, `user_blocks`.
  - Indexes: composite indexes for state/category/rating search, subscription expiry scan, and payment reference idempotency.
  - Private storage buckets: `identity-selfies` and `identity-documents`.
- **Target Files / Modules:**
  - `supabase/migrations/20261123_000001_initial_schema.sql`
  - `supabase/migrations/20261123_000002_rls_and_storage.sql`
  - `supabase/seed.sql`
  - `src/types/database.ts`
  - `src/types/domain.ts`
  - `src/types/api.ts`
  - `src/lib/constants/nigeria-states.ts`
  - `src/lib/constants/service-categories.ts`
  - `src/lib/supabase/client.ts`
  - `src/lib/supabase/server.ts`
  - `src/lib/supabase/admin.ts`
- **Actionable Tasks:**
  - [x] **Task 1.1:** Write initial PostgreSQL migration (`initial_schema.sql`) defining all 8 core tables, UUID primary keys, check constraints, foreign keys with cascade/restrict rules, and query-driven composite indexes from `DATABASE.md`.
  - [x] **Task 1.2:** Write RLS and storage migration (`rls_and_storage.sql`) enabling RLS across all tables, defining customer/provider/admin policies, and configuring private buckets for `identity-selfies` and `identity-documents`.
  - [x] **Task 1.3:** Create `supabase/seed.sql` with test accounts across roles: admin user, customer users in different states, active 1-month free trial provider, active paid ₦1,000/month provider, and expired provider (contacts hidden).
  - [x] **Task 1.4:** Define domain and database TypeScript interfaces in `src/types/database.ts`, `src/types/domain.ts`, and `src/types/api.ts`.
  - [x] **Task 1.5:** Create Nigerian 36 states (+ FCT) constants (`src/lib/constants/nigeria-states.ts`) and approved service categories (`src/lib/constants/service-categories.ts`).
  - [x] **Task 1.6:** Implement Supabase client factories (`src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`) using `@supabase/supabase-js` and `@supabase/ssr`.
- **Testing & Completion Criteria:**
  - Migration SQL syntax is valid and executes without errors against PostgreSQL.
  - Foreign key cascades, check constraints, and unique indexes function as specified in `DATABASE.md`.
  - Private storage buckets reject unauthenticated public reads.
  - TypeScript types correctly reflect all database columns and nullable states.

---

### Phase 2: Core API & Auth Foundations

- **Phase Goal:** Build backend validation schemas, error hierarchy, contact privacy sanitization with zero-grace-period enforcement, route protection middleware, and health check API.
- **Prerequisites / Dependencies:** Phase 1 complete.
- **Database / API Changes:**
  - New Route: `GET /api/health`
- **Target Files / Modules:**
  - `src/lib/errors.ts`
  - `src/lib/logger.ts`
  - `src/lib/rate-limit.ts`
  - `src/lib/contact-sanitizer.ts`
  - `src/lib/validation/auth.schema.ts`
  - `src/lib/validation/provider.schema.ts`
  - `src/lib/validation/subscription.schema.ts`
  - `src/lib/validation/rating.schema.ts`
  - `src/lib/validation/moderation.schema.ts`
  - `src/middleware.ts`
  - `src/app/api/health/route.ts`
  - `tests/unit/contact-sanitizer.test.ts`
  - `tests/unit/subscription-rules.test.ts`
- **Actionable Tasks:**
  - [x] **Task 2.1:** Implement application error hierarchy (`src/lib/errors.ts`) and structured JSON logger with PII/OTP redaction (`src/lib/logger.ts`).
  - [x] **Task 2.2:** Build Zod input validation schemas for auth, provider profile, subscription, rating, and moderation payloads in `src/lib/validation/**`.
  - [x] **Task 2.3:** Implement `src/lib/contact-sanitizer.ts` strictly stripping `phone_number` and `whatsapp_number` when provider trial or subscription is inactive or expired (`current_period_end <= now()`, zero grace period).
  - [x] **Task 2.4:** Write unit tests for subscription validity rules and contact sanitization in `tests/unit/subscription-rules.test.ts` and `tests/unit/contact-sanitizer.test.ts`.
  - [x] **Task 2.5:** Implement Next.js session refresh and RBAC route protection middleware (`src/middleware.ts`) guarding `/provider/**` and `/admin/**`.
  - [x] **Task 2.6:** Create liveness check route handler `src/app/api/health/route.ts` returning standard JSON envelope.
- **Testing & Completion Criteria:**
  - Unit tests for contact sanitizer pass 100%, proving expired/unpaid providers never leak phone/WhatsApp numbers.
  - Middleware redirects unauthenticated requests on protected routes to `/auth/login`.
  - `GET /api/health` returns `{ ok: true, data: { status: "healthy" } }`.

---

### Phase 3: Onboarding, Identity Capture & 1-Month Free Trial

- **Phase Goal:** Build complete end-to-end user onboarding: welcome screen, email OTP sign-up/login, role selection, zero-cost camera selfie + valid ID upload, and automatic 1-month free trial activation for service providers.
- **Prerequisites / Dependencies:** Phases 1 & 2 complete.
- **Database / API Changes:**
  - Route: `POST /api/identity`
  - Auto-inserts into `subscriptions` (`plan_type = 'free_trial'`, `status = 'active'`, `current_period_end = now() + 30 days`) for new providers.
- **Target Files / Modules:**
  - `src/services/auth-service.ts`
  - `src/services/identity-service.ts`
  - `src/app/api/identity/route.ts`
  - `src/components/layout/top-nav.tsx`
  - `src/components/layout/app-shell.tsx`
  - `src/components/ui/button.tsx`
  - `src/components/ui/input.tsx`
  - `src/components/ui/card.tsx`
  - `src/components/ui/badge.tsx`
  - `src/components/auth/otp-auth-form.tsx`
  - `src/components/onboarding/selfie-id-capture.tsx`
  - `src/app/page.tsx`
  - `src/app/layout.tsx`
  - `src/app/auth/signup/page.tsx`
  - `src/app/auth/login/page.tsx`
  - `src/app/onboarding/kyc-capture/page.tsx`
- **Actionable Tasks:**
  - [x] **Task 3.1:** Implement core UI primitives: `Button`, `Input`, `Card`, `Badge` adhering to `DESIGN.md` tokens and 44x44px minimum tap targets.
  - [x] **Task 3.2:** Build responsive sticky `TopNav` (`src/components/layout/top-nav.tsx`) and `AppShell` (`src/components/layout/app-shell.tsx`) with active link indicators and dual-theme support.
  - [x] **Task 3.3:** Implement `auth-service.ts` for email OTP request/verification via Supabase Auth.
  - [x] **Task 3.4:** Build `OtpAuthForm` (`src/components/auth/otp-auth-form.tsx`) and wire `/auth/signup` (with role toggle: Customer vs. Service Provider) and `/auth/login`.
  - [x] **Task 3.5:** Implement `identity-service.ts` and `src/app/api/identity/route.ts` to upload camera selfie and valid ID image to private Supabase storage and insert `identity_records`.
  - [x] **Task 3.6:** Build `SelfieIdCapture` (`src/components/onboarding/selfie-id-capture.tsx`) with live camera stream (`getUserMedia`) and file upload fallback for valid ID cards (NIN, Voter's Card, Driver's License, Passport).
  - [x] **Task 3.7:** Wire provider onboarding completion to automatically grant 1-month free trial (`free_trial`, 30 days, status `active`) and redirect to `/provider/dashboard` or `/explore`.
  - [x] **Task 3.8:** Build welcome landing page (`src/app/page.tsx`) with PWA install prompts, value propositions, and role-based CTAs.
- **Testing & Completion Criteria:**
  - First-time user can request and verify email OTP.
  - Role selection accurately bifurcates flow.
  - Selfie and ID upload to private storage and create corresponding `identity_records` entry without third-party paid verification fees.
  - Service provider account receives automatic 30-day active trial.

---

### Phase 4: 36-State Location Search, Star Ratings & Direct Contact

- **Phase Goal:** Deliver customer discovery across Nigeria's 36 states, service category and rating ranking, provider profile cards, gated direct phone/WhatsApp contact actions, rating submissions, and safety report/block controls.
- **Prerequisites / Dependencies:** Phases 1–3 complete.
- **Database / API Changes:**
  - Routes: `GET /api/providers`, `GET /api/providers/[id]`, `POST /api/ratings`, `POST /api/moderation/report`, `POST /api/moderation/block`
- **Target Files / Modules:**
  - `src/services/provider-service.ts`
  - `src/services/rating-service.ts`
  - `src/services/moderation-service.ts`
  - `src/app/api/providers/route.ts`
  - `src/app/api/providers/[id]/route.ts`
  - `src/app/api/ratings/route.ts`
  - `src/app/api/moderation/report/route.ts`
  - `src/app/api/moderation/block/route.ts`
  - `src/components/providers/provider-card.tsx`
  - `src/components/providers/provider-filters.tsx`
  - `src/components/providers/provider-contact-gate.tsx`
  - `src/components/providers/rating-form.tsx`
  - `src/components/moderation/report-block-modal.tsx`
  - `src/app/explore/page.tsx`
  - `src/app/providers/[id]/page.tsx`
  - `src/app/profile/page.tsx`
- **Actionable Tasks:**
  - [x] **Task 4.1:** Implement `provider-service.ts` with multi-filter queries across 36 states, category, search keywords, rating rank, blocked user exclusion, and contact sanitization.
  - [x] **Task 4.2:** Implement API route handlers `GET /api/providers` and `GET /api/providers/[id]`.
  - [x] **Task 4.3:** Build `ProviderFilters` component with 36-state picker, category chips, and star rating sorting.
  - [x] **Task 4.4:** Build `ProviderCard` and `ProviderContactGate` displaying direct `Call` (`tel:`) and `WhatsApp` (`https://wa.me/...`) buttons when active, or `Contact Hidden` when expired/unpaid.
  - [x] **Task 4.5:** Build `/explore` page with search bar, filters, provider list grid, and empty states.
  - [x] **Task 4.6:** Build `/providers/[id]` detail page with full bio, rating breakdown, contact gate, and report/block actions.
  - [x] **Task 4.7:** Implement `rating-service.ts` and `POST /api/ratings` ensuring 1–5 star validation, blocking self-rating, and atomically recalculating average rating.
  - [x] **Task 4.8:** Implement `moderation-service.ts`, report/block routes, and `ReportBlockModal` component.
  - [x] **Task 4.9:** Build user `/profile` page with state preference, block list management, and sign-out action.
- **Testing & Completion Criteria:**
  - Search correctly filters providers by Nigerian state and category, sorted by star rating.
  - Contact buttons are clickable for active providers and completely omitted/hidden for expired providers.
  - Star ratings update aggregate rating and count correctly.
  - Blocked users disappear from the blocker's search results.

---

### Phase 5: Paystack Monthly Subscription (₦1,000/Month) & Zero-Grace Enforcement

- **Phase Goal:** Integrate Paystack checkout for ₦1,000/month provider subscription renewals, signed webhook handler with idempotency, provider subscription dashboard, and automated zero-grace-period expiry checks.
- **Prerequisites / Dependencies:** Phases 1–4 complete; Paystack API credentials.
- **Database / API Changes:**
  - Routes: `GET /api/subscriptions/status`, `POST /api/subscriptions/initialize`, `POST /api/subscriptions/expire-check`, `POST /api/webhooks/paystack`
  - Mutations on `subscriptions` and `payment_events`.
- **Target Files / Modules:**
  - `src/services/paystack-service.ts`
  - `src/services/subscription-service.ts`
  - `src/app/api/subscriptions/status/route.ts`
  - `src/app/api/subscriptions/initialize/route.ts`
  - `src/app/api/subscriptions/expire-check/route.ts`
  - `src/app/api/webhooks/paystack/route.ts`
  - `src/components/subscriptions/subscription-status-card.tsx`
  - `src/app/provider/dashboard/page.tsx`
  - `src/app/provider/subscription/page.tsx`
  - `tests/integration/paystack-webhook.test.ts`
- **Actionable Tasks:**
  - [x] **Task 5.1:** Implement `paystack-service.ts` with transaction initialization for ₦1,000 (`100000` kobo) and HMAC SHA-512 webhook signature verification.
  - [x] **Task 5.2:** Implement `subscription-service.ts` managing subscription states, 1-month extensions, and zero-grace-period expiry evaluation.
  - [x] **Task 5.3:** Build API route handlers: `/api/subscriptions/status` and `/api/subscriptions/initialize`.
  - [x] **Task 5.4:** Implement `POST /api/webhooks/paystack` verifying signature, logging unique payment reference in `payment_events`, and idempotently extending subscription period.
  - [x] **Task 5.5:** Implement `POST /api/subscriptions/expire-check` protected by `CRON_SECRET` to immediately transition past-due records (`current_period_end <= now()`) to `expired` status.
  - [x] **Task 5.6:** Build `SubscriptionStatusCard` displaying trial/subscription status, days remaining, and zero-grace policy notice.
  - [x] **Task 5.7:** Build `/provider/dashboard` with profile summary, status badge, quick renewal CTA, and rating metrics.
  - [x] **Task 5.8:** Build `/provider/subscription` page with Paystack checkout trigger and payment history.
  - [x] **Task 5.9:** Write integration test `tests/integration/paystack-webhook.test.ts` verifying signature rejection, successful credit, and duplicate event idempotency.
- **Testing & Completion Criteria:**
  - Paystack webhook validates HMAC SHA-512 signature and rejects forged payloads with 401.
  - Successful webhook extends subscription by 30 days and logs event.
  - Duplicate webhook delivery is handled idempotently without extending multiple times.
  - When period expires, zero grace period is strictly enforced and contact details become hidden immediately.

---

### Phase 6: Optional AI Helper (`P1`) & Admin Moderation (`P1`)

- **Phase Goal:** Add optional free-tier OpenRouter AI helper for provider bios and service category matching with fallback, plus operator `/admin` moderation view for reports and payment logs.
- **Prerequisites / Dependencies:** Phases 1–5 complete.
- **Database / API Changes:**
  - Route: `POST /api/ai/assist`
  - Admin inspection queries on `reports`, `identity_records`, `payment_events`.
- **Target Files / Modules:**
  - `src/services/ai-service.ts`
  - `src/app/api/ai/assist/route.ts`
  - `src/app/admin/page.tsx`
- **Actionable Tasks:**
  - [x] **Task 6.1:** Implement `ai-service.ts` invoking OpenRouter free-tier model (`:free`) with timeout, input sanitization, and fallback error handling.
  - [x] **Task 6.2:** Create `POST /api/ai/assist` route handler with rate limiting for bio polishing and category suggestion.
  - [x] **Task 6.3:** Wire AI helper trigger in provider dashboard/profile edit with fallback messaging when AI service is unavailable.
  - [x] **Task 6.4:** Build `/admin` moderation page guarded by `admin` role, providing report review queue, identity record audit, and Paystack payment log inspection.
- **Testing & Completion Criteria:**
  - AI assist endpoint produces formatted suggestions using free-tier model.
  - If OpenRouter fails or times out, app displays graceful fallback without breaking page.
  - Non-admin users are blocked from `/admin` route.

---

### Final Phase: Polish & QA

- **Phase Goal:** Execute comprehensive visual polish, responsive validation, loading and empty state coverage, accessibility audits, end-to-end smoke tests, and production deployment preparation.
- **Prerequisites / Dependencies:** All preceding phases complete.
- **Database / API Changes:** None.
- **Target Files / Modules:**
  - `src/components/ui/skeleton.tsx`
  - `src/components/states/empty-state.tsx`
  - `src/components/states/error-state.tsx`
  - `src/app/error.tsx`
  - `src/app/not-found.tsx`
  - `tests/e2e/customer-discovery.spec.ts`
  - `README.md`
- **Actionable Tasks:**
  - [x] **Task 7.1:** Implement skeleton placeholders (`src/components/ui/skeleton.tsx`) for provider cards, detail views, and subscription dashboard to ensure zero CLS.
  - [x] **Task 7.2:** Implement uniform `EmptyState` and `ErrorState` components across search, profile, and dashboard routes.
  - [x] **Task 7.3:** Build global `error.tsx` and `not-found.tsx` boundary handlers.
  - [x] **Task 7.4:** Conduct full accessibility and responsive audit: verify 44x44px minimum tap targets, WCAG AA contrast in both light and dark themes, keyboard navigability, and zero horizontal scroll on 360px mobile viewports.
  - [x] **Task 7.5:** Write end-to-end smoke test suite (`tests/e2e/customer-discovery.spec.ts`) validating customer search, rating view, and contact gate flow.
  - [x] **Task 7.6:** Finalize `README.md` with setup instructions, environment variable guide, and production deployment checklist.
- **Testing & Completion Criteria:**
  - Zero TypeScript errors across entire repository.
  - All unit, integration, and E2E tests pass.
  - Responsive layout verified across mobile (360px–430px) and desktop viewports.
  - PWA installs and functions with offline shell fallback.
