```markdown
# Technical Architecture (`ARCHITECTURE.md`): ASAP

- **Document Version:** 1.0 (MVP Baseline)
- **Product Name:** ASAP
- **Architectural Pattern:** Monolithic Full-Stack Progressive Web App (Next.js App Router + Node.js Server Routes / Server Actions + Supabase + Paystack + OpenRouter Free Tier)
- **Geographic & Commercial Scope:** All 36 states of Nigeria (plus FCT where supported), Email OTP authentication, zero-cost sign-up selfie + valid ID capture, 1-month free introductory period for service providers followed by **₦1,000/month** via **Paystack**, **zero grace period** (immediate automatic contact hiding when expired/unpaid), and top navigation across mobile and desktop viewports.
- **Source of Truth:** `project-brief.md`, `PRD.md`, and `DESIGN.md`.

---

## 1. Architecture Overview & Core Philosophy

### Architectural Pattern
ASAP uses a **Monolithic Full-Stack App** architecture built on **Next.js (App Router)** with **TypeScript**, backed by **Supabase** (PostgreSQL database, Email OTP auth, and private/access-controlled file storage), **Paystack** (monthly `₦1,000` provider subscription billing and webhooks), and **OpenRouter** (free-tier AI helper endpoints). A single cohesive codebase hosts the PWA frontend, server-side API route handlers/server actions, and automated subscription-expiry enforcement—eliminating multi-service deployment overhead and keeping MVP infrastructure costs at zero upfront spend.

### Core Engineering Principles
1. **Simplicity & Zero Upfront Cost First:** Favor built-in platform capabilities, free starter tiers, and transaction-fee-only services over paid third-party verification APIs, extra servers, or premature microservices.
2. **Strict Server-Side Enforcement of Business Rules:** Subscription validity (1-month free trial or paid `₦1,000/month` period with **zero grace period**), contact visibility (`phone_number` and `whatsapp_number` hiding), OTP verification, and Paystack webhook validation are enforced on the server—never trusted to client-side UI state alone.
3. **Strict Type Safety & Schema Validation:** TypeScript strict mode across the entire repository paired with runtime input validation schemas at every trust boundary (forms, API routes, webhooks, and external responses).
4. **Domain Colocation & Clean Separation:** Group code cleanly by layer (`app/` routes, `components/` UI, `services/` business logic & data access, `lib/` utilities & clients, `types/` shared contracts) without circular imports or database calls inside React components.
5. **Zero Premature Abstraction:** Build straightforward, readable modules tailored to MVP requirements (`PRD.md` & `DESIGN.md`) rather than generic over-engineered frameworks or speculative queues.

---

## 2. Approved Tech Stack & Dependency Manifest

### Technology Layer Breakdown

| Layer | Approved Choice | Rationale for ASAP MVP |
| :--- | :--- | :--- |
| **Frontend Framework & Language** | **Next.js (App Router)** + **TypeScript** | Supports SSR/hybrid rendering, fast mobile-first routing, PWA manifest/service-worker integration, and end-to-end type safety with zero upfront license cost. |
| **Styling & Design System** | **Tailwind CSS** + CSS Custom Properties (`DESIGN.md` tokens) | Implements light/dark dual-theme tokens, exact spacing/radius/elevation scales, `44x44px` tap targets, and responsive grids cleanly with minimal bundle weight. |
| **UI Primitives & Icons** | Accessible headless/lightweight UI primitives + `lucide-react` | Keeps modals/sheets/dialogs keyboard-accessible (`Escape`, focus management, `aria` attributes) without bloated component suites. |
| **State Management** | React Server/Client state + URL query params + lightweight client state (`zustand` or React context/hooks) | Search filters (state across 36 states, category, star rating) stay shareable/bookmarkable via URL/state; minimal client state for UI drawers/modals/drafts. |
| **Form & Validation Library** | `react-hook-form` + `zod` | Provides predictable form state, inline field validation, and shared TypeScript-inferred validation schemas across client and server routes. |
| **Backend / Runtime** | **Node.js** via Next.js Route Handlers (`app/api/**`) & Server Actions | Keeps backend logic in the same Node.js runtime as the frontend with no separate backend hosting bill at launch. |
| **Database & File Storage** | **Supabase** (PostgreSQL + Storage buckets + Auth/Email OTP) | Provides free starter relational persistence, row-level security (RLS) policies, and private/access-controlled storage buckets for live selfies and valid ID photos. |
| **Payments** | **Paystack** (server-initialized checkouts + signed webhooks) | Supports `₦1,000/month` NGN subscriptions with zero fixed monthly account fee (per-transaction fee only) and reliable webhook notifications. |
| **AI Helper (`P1`)** | **OpenRouter** free-tier models (`:free`) via server proxy | Enables optional service bio polishing and problem-to-category matching at zero AI cost with server-side timeout and fallback handling. |
| **Infrastructure & Hosting** | **Vercel** (free starter tier) + Supabase cloud | Seamless Git push previews and production deploys for Next.js PWAs; scheduled cron/endpoint checks keep subscription statuses current without extra servers. |

### Approved Core Libraries vs. Banned Dependencies
- **Approved Core Libraries:**
  - `next`, `react`, `react-dom`, `typescript`
  - `tailwindcss`
  - `@supabase/supabase-js`, `@supabase/ssr`
  - `zod`, `react-hook-form`, `@hookform/resolvers`
  - `lucide-react` (sole icon library)
  - `date-fns` (date/billing-period formatting and comparison)
- **Banned / Avoided Dependencies (for MVP):**
  - Paid biometric face-match or paid ID-verification SDKs (deferred to post-MVP per cost rules).
  - Multiple competing icon libraries (e.g., no mixing FontAwesome, Material Icons, and Heroicons).
  - Heavy client state engines (e.g., no Redux boilerplate) or separate ORMs (e.g., no Prisma/TypeORM alongside Supabase client unless strictly needed—use Supabase typed database access cleanly).
  - Redis clusters, Kafka/RabbitMQ message brokers, or microservices frameworks in MVP.

---

## 3. Frontend & Backend System Architecture

### Frontend Architecture
- **Rendering Strategy (Hybrid SSR + Client Interactivity):**
  - Public entry (`/`) and catalog/discovery routes (`/explore`, `/providers/[id]`) render cleanly with server-side initial data/metadata and hydrate interactive filter, search, rating, and contact controls on the client.
  - Private/authenticated views (`/provider/dashboard`, `/provider/subscription`, `/profile`, `/admin`) enforce session/role checks on the server and render interactive user controls.
- **PWA Architecture:**
  - Web App Manifest (`public/manifest.json`) configured for **ASAP** (`display: standalone`, icons, light/dark theme colors) and service worker registration for static shell resilience and offline fallback awareness.
- **Server vs. Client Component Boundaries:**
  - **Server Components (Default):** Fetch initial page data, enforce session/role guards, pass sanitized DTOs (`Data Transfer Objects`, shaped safe objects) to client views, and never pass raw secrets or unverified/hidden contact fields when a subscription is inactive.
  - **Client Components (`"use client"`):** Handle camera selfie capture (`getUserMedia` with file input fallback), valid ID file selection, OTP input/resend timers, interactive filters (36 states, categories, star ratings), Paystack checkout triggers, rating/report/block modals, and theme/mobile menu interactions.
- **Design Token Integration (`DESIGN.md`):**
  - All visual tokens (light/dark canvas, surface, text, accent, semantic status colors, type scale, radii, shadows) map to CSS custom properties and Tailwind utilities so components never hardcode arbitrary one-off colors or spacing.

### Backend Architecture
- **Service Layer Organization:**
  - Route handlers (`app/api/**`) and Server Actions act as thin transport/entry layers: they parse inputs, authenticate/authorize the caller, delegate business rules to `services/**`, and format standard responses.
  - Domain services (`services/subscription-service.ts`, `services/provider-service.ts`, `services/identity-service.ts`, `services/rating-service.ts`, `services/moderation-service.ts`, `services/ai-service.ts`, `services/paystack-service.ts`) encapsulate all domain rules and database operations.
- **Subscription & Zero-Grace-Period Enforcement:**
  - A dedicated subscription evaluation helper computes whether a provider's **1-month free trial** or **₦1,000/month Paystack subscription** is currently active (`status === 'active'` and `current_period_end > now`), with **zero grace period**.
  - A scheduled endpoint (e.g., Vercel Cron hitting a protected internal route) periodically marks expired rows as `expired` and ensures inactive/expired providers never leak `phone_number` or `whatsapp_number` in public/customer responses.
- **Middleware Pipeline:**
  - Next.js middleware refreshes auth sessions where appropriate, guards protected routes, and attaches baseline security headers.

---

## 4. End-to-End Data Flow & State Lifecycle

### Read Flow (Customer Searching & Viewing a Provider)
1. **User Request:** Customer opens `/explore` or `/providers/[id]` with selected state (from Nigeria's 36 states), optional area/category/rating filter, and search query.
2. **Route & Auth Check:** Server component/route resolves session (if signed in) and validates query parameters via `zod`.
3. **Service Query & Subscription Gate:** `provider-service` queries Supabase for matching providers, excludes users blocked by/blocking the current user (when signed in), ranks by location match and average star rating, and joins/evaluates current subscription/trial status (`current_period_end > now`, no grace period).
4. **Contact Sanitization:** Before returning provider DTOs to the client, the service strips `phone_number` and `whatsapp_number` (and sets `canContact: false`) for any provider whose trial or `₦1,000/month` subscription is expired or unpaid.
5. **UI Rendering:** Client renders provider cards/detail view with `Call` (`tel:`) and `WhatsApp` (`https://wa.me/...`) buttons only when `canContact: true`, or a `Contact Hidden` notice when `false`.

### Write / Mutation Flow (Provider Paying `₦1,000/month` via Paystack)
1. **User Action:** Service provider taps **"Pay ₦1,000 with Paystack"** on `/provider/subscription` or `/provider/dashboard`.
2. **Client Validation & Request:** Client validates provider eligibility and sends a POST request to `/api/subscriptions/initialize`.
3. **Server Auth & Initialization:** Server verifies authenticated `provider` role, validates payload with `zod`, creates a pending payment/subscription reference in Supabase, and calls Paystack's initialization API for `₦1,000` (`100000` kobo).
4. **Checkout & Webhook Verification:** Provider completes payment on Paystack; Paystack sends a signed webhook event to `/api/webhooks/paystack`.
5. **Idempotent Transaction & State Update:** `paystack-service` and `subscription-service` verify the Paystack signature, check event/reference idempotency so duplicate webhooks do not double-extend, update `subscriptions` (`status = 'active'`, `plan_type = 'monthly_1000_ngn'`, `current_period_end` extended by 1 month), and immediately restore contact eligibility.
6. **UI Feedback:** Provider returns to `/provider/subscription` or `/provider/dashboard` and sees updated `Active` status and confirmation toast.

---

## 5. Exact Project Folder & File Structure

### Visual Directory Tree

```text
asap-pwa/
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── offline.html
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   ├── page.tsx
│   │   ├── auth/
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   └── login/
│   │   │       └── page.tsx
│   │   ├── onboarding/
│   │   │   └── kyc-capture/
│   │   │       └── page.tsx
│   │   ├── explore/
│   │   │       └── page.tsx
│   │   ├── providers/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── provider/
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   └── subscription/
│   │   │       └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── admin/
│   │   │       └── page.tsx
│   │   └── api/
│   │       ├── health/
│   │       │   └── route.ts
│   │       ├── providers/
│   │       │   ├── route.ts
│   │       │   └── [id]/
│   │       │       └── route.ts
│   │       ├── identity/
│   │       │   └── route.ts
│   │       ├── subscriptions/
│   │       │   ├── status/
│   │       │   │   └── route.ts
│   │       │   ├── initialize/
│   │       │   │   └── route.ts
│   │       │   └── expire-check/
│   │       │       └── route.ts
│   │       ├── webhooks/
│   │       │   └── paystack/
│   │       │       └── route.ts
│   │       ├── ratings/
│   │       │   └── route.ts
│   │       ├── moderation/
│   │       │   ├── report/
│   │       │   │   └── route.ts
│   │       │   └── block/
│   │       │       └── route.ts
│   │       └── ai/
│   │           └── assist/
│   │               └── route.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── top-nav.tsx
│   │   │   ├── app-shell.tsx
│   │   │   └── pwa-register.tsx
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── toast.tsx
│   │   │   └── skeleton.tsx
│   │   ├── states/
│   │   │   ├── empty-state.tsx
│   │   │   └── error-state.tsx
│   │   ├── auth/
│   │   │   └── otp-auth-form.tsx
│   │   ├── onboarding/
│   │   │   └── selfie-id-capture.tsx
│   │   ├── providers/
│   │   │   ├── provider-card.tsx
│   │   │   ├── provider-filters.tsx
│   │   │   ├── provider-contact-gate.tsx
│   │   │   └── rating-form.tsx
│   │   ├── subscriptions/
│   │   │   └── subscription-status-card.tsx
│   │   └── moderation/
│   │       └── report-block-modal.tsx
│   ├── services/
│   │   ├── auth-service.ts
│   │   ├── identity-service.ts
│   │   ├── provider-service.ts
│   │   ├── subscription-service.ts
│   │   ├── paystack-service.ts
│   │   ├── rating-service.ts
│   │   ├── moderation-service.ts
│   │   └── ai-service.ts
│   ├── lib/
│   │   ├── env.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── admin.ts
│   │   ├── validation/
│   │   │   ├── auth.schema.ts
│   │   │   ├── provider.schema.ts
│   │   │   ├── subscription.schema.ts
│   │   │   ├── rating.schema.ts
│   │   │   └── moderation.schema.ts
│   │   ├── constants/
│   │   │   ├── nigeria-states.ts
│   │   │   └── service-categories.ts
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   ├── rate-limit.ts
│   │   └── contact-sanitizer.ts
│   └── types/
│       ├── database.ts
│       ├── domain.ts
│       └── api.ts
├── tests/
│   ├── unit/
│   │   ├── subscription-rules.test.ts
│   │   └── contact-sanitizer.test.ts
│   ├── integration/
│   │   └── paystack-webhook.test.ts
│   └── e2e/
│       └── customer-discovery.spec.ts
├── .env.example
├── next.config.ts
├── tsconfig.json
└── package.json

```

### Folder Responsibilities & Naming Conventions

* **`public/`:** Static PWA assets (`manifest.json`, service worker, icons, offline fallback page).
* **`src/app/`:** Next.js App Router pages (`page.tsx`) and HTTP route handlers (`route.ts`). Nested folders mirror URL routes (`PRD.md`).
* **`src/components/`:** Reusable UI primitives (`ui/`), layout shells (`layout/`), state views (`states/`), and feature-specific components grouped by domain (`auth/`, `onboarding/`, `providers/`, `subscriptions/`, `moderation/`).
* **`src/services/`:** Core domain logic, subscription/trial checks, external gateway adapters (`paystack-service.ts`, `ai-service.ts`), and database queries.
* **`src/lib/`:** Environment validation (`env.ts`), Supabase client helpers (`supabase/`), `zod` schemas (`validation/`), Nigerian 36-state/category constants (`constants/`), error classes, logging, and contact sanitization.
* **`src/types/`:** Shared TypeScript interfaces and DTOs (`database.ts`, `domain.ts`, `api.ts`).
* **`tests/`:** Unit, integration, and end-to-end tests.
* **Naming Conventions:** Use `kebab-case` for file and folder names (e.g., `provider-contact-gate.tsx`, `subscription-service.ts`), `PascalCase` for exported React components and TypeScript types/interfaces, and `camelCase` for functions, hooks, and variables.

---

## 6. Database Interaction & Data Access Layer

* **Connection & Client Pattern:** Use Supabase browser client (`lib/supabase/client.ts`) strictly for browser auth/session operations where appropriate, server client (`lib/supabase/server.ts`) per request with user cookies/session context, and privileged admin client (`lib/supabase/admin.ts`) exclusively inside server-side services for webhook processing, scheduled subscription expiry checks, and authorized admin moderation tasks.
* **Query Placement Rule:** Direct database queries and storage calls are allowed **only** inside `src/services/**` (and authorized server helpers). React components (`src/components/**`) and page files (`src/app/**/page.tsx`) must never invoke raw SQL or database queries directly; they call service functions or `/api/**` routes.
* **Migrations & Schema Evolution:** Manage schema changes via versioned Supabase/SQL migration files checked into source control; never mutate production schema ad-hoc from application code.
* **Transactions & Idempotency:** Multi-step mutations (such as activating a `₦1,000/month` subscription and recording a Paystack payment event, or updating a provider's rating aggregate) must execute atomically via database functions/RPCs or idempotent service checks keyed on unique payment/event references.
* **Row-Level Security (RLS) & Storage Policies:** Enable RLS on application tables and keep selfie and ID document buckets **private** (non-public), requiring authenticated/authorized access rather than public URLs.

---

## 7. Authentication, Authorization & Session Architecture

* **Auth Mechanics:** Email **OTP (One-Time Password)** sign-up and login via Supabase Auth (`signInWithOtp` / `verifyOtp`) over HTTP-only/cookie-managed sessions, keeping onboarding cost at zero upfront SMS fees.
* **Verification Layers:**
1. **Edge / Middleware:** Refreshes session tokens and redirects unauthenticated visitors away from protected routes (`/provider/dashboard`, `/provider/subscription`, `/profile`, `/admin`).
2. **Server / Route / Service Layer:** Verifies authenticated user identity (`user.id`), checks account status (`is_blocked_by_system`), and enforces **Role-Based Access Control (RBAC)** (`guest`, `customer`, `provider`, `admin`) before executing reads or writes.
3. **Database Layer:** Enforces RLS policies so users can only modify their own profiles, ratings, blocks, and reports, while public listing views only expose eligible provider records with sanitized contact fields.


* **Selfie & ID Capture Flow:** During onboarding (`/onboarding/kyc-capture`), the user captures a live camera selfie and uploads a valid ID image; files upload through an authenticated server route/signed path into private Supabase storage with metadata saved in `identity_records` without calling paid third-party verification APIs.

---

## 8. API Architecture & Communication Contracts

* **Internal RESTful Route Handlers (`src/app/api/**`):**
* `GET /api/health` — Liveness check.
* `GET /api/providers` — Searches/filters providers by state (across Nigeria's 36 states), area, service category, minimum star rating, and pagination; returns sanitized contact fields based on active subscription/trial state.
* `GET /api/providers/[id]` — Returns provider profile, rating summary, and gated phone/WhatsApp contact details (only when subscription/trial is active with no grace period elapsed).
* `POST /api/identity` — Saves selfie and valid ID capture metadata/paths for the authenticated user.
* `GET /api/subscriptions/status` — Returns current provider trial/subscription state (`free_trial` or `monthly_1000_ngn`, `active` or `expired`/`unpaid`, `current_period_end`, and `contactsVisible`).
* `POST /api/subscriptions/initialize` — Initializes a **₦1,000** (`100000` kobo) **Paystack** checkout session for an authenticated `provider`.
* `POST /api/subscriptions/expire-check` — Protected scheduled/cron handler that evaluates expired trials/subscriptions (`current_period_end <= now`) with **zero grace period** and marks them expired.
* `POST /api/webhooks/paystack` — Receives Paystack payment events, verifies `x-paystack-signature`, enforces idempotency, and activates/extends the provider's monthly subscription.
* `POST /api/ratings` — Submits or updates a customer's `1–5` star rating for a provider (blocks self-rating).
* `POST /api/moderation/report` & `POST /api/moderation/block` — Persists safety reports and user blocks.
* `POST /api/ai/assist` — Optional (`P1`) free-tier OpenRouter helper for polishing a provider bio or mapping a service request to a category.


* **Validation & Response Envelope:**
* All incoming JSON bodies and query params are validated with `zod`; validation failures return `400` with structured field errors.
* Standard JSON envelope: `{ ok: true, data: ... }` on success, and `{ ok: false, error: { code: string, message: string, details?: unknown } }` on error.


* **Pagination & Rate Limiting:**
* List endpoints (`GET /api/providers`) support `page` and `pageSize` parameters with sensible bounds (e.g., default `20`, max `50`) and return total/hasMore metadata.
* Rate limits apply to OTP requests, `/api/ai/assist`, and write endpoints to prevent abuse.



---

## 9. External Services & Third-Party Integrations

* **Adapter / Service Pattern:** Every external dependency (`Paystack`, `OpenRouter`, `Supabase`) is wrapped in a dedicated module inside `src/services/` (`paystack-service.ts`, `ai-service.ts`, `lib/supabase/*`) so SDK/API changes stay isolated from UI components.
* **Paystack Integration Rules:**
* Server initializes transactions with `₦1,000` (`100000` kobo), `NGN` currency, provider email, and unique reference metadata.
* `/api/webhooks/paystack` reads the raw request body, computes HMAC SHA-512 using `PAYSTACK_SECRET_KEY`, compares against `x-paystack-signature`, and rejects invalid signatures with `401`.
* Only `charge.success` with matching amount/currency activates or extends the subscription period; duplicate webhook deliveries are safely ignored (`200` already processed).


* **Timeouts & Retries:** Outbound external HTTP calls (`Paystack`, `OpenRouter`) enforce explicit request timeouts (e.g., `8s–12s`) and bounded retries only on transient network/5xx errors for idempotent operations.

---

## 10. AI / LLM Architecture

* **Purpose (`P1`):** Optional helper features aligned with `PRD.md`—helping service providers polish a clear business description and helping customers match everyday problem wording to a service category.
* **Model Routing & Zero-Cost Guardrail:** Routes requests through **OpenRouter** using configured free-tier model IDs (`:free` models) so MVP AI usage incurs zero API spend.
* **Prompt & Output Handling:** Prompts are constructed on the server with strict system instructions and input length limits; outputs are trimmed, sanitized, and validated before returning to the UI.
* **Fallback Behavior:** If OpenRouter times out, rate-limits, or returns an error, `/api/ai/assist` returns a graceful fallback response and the UI shows a non-blocking notice so users can type or choose manually without blocking core flows.

---

## 11. Environment Configuration & Secrets Management

### `.env.example` Blueprint

```text
# Public / Client-Safe Variables (safe to expose in browser bundle)
NEXT_PUBLIC_APP_NAME=ASAP
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

# Server-Only Secrets (NEVER expose with NEXT_PUBLIC_ prefix)
SUPABASE_SERVICE_ROLE_KEY=
PAYSTACK_SECRET_KEY=
PAYSTACK_WEBHOOK_SECRET=
SUBSCRIPTION_MONTHLY_AMOUNT_NGN=1000
FREE_TRIAL_DAYS=30
OPENROUTER_API_KEY=
OPENROUTER_FREE_MODEL=
CRON_SECRET=

```

* **Startup / Runtime Validation:** `src/lib/env.ts` validates required environment variables using `zod` at module/server startup and fails fast with a clear error message if mandatory secrets are missing, while keeping `NEXT_PUBLIC_*` strictly non-secret.

---

## 12. Error Handling, Logging & Observability

* **Error Hierarchy (`src/lib/errors.ts`):** Define typed application errors (`ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `PaymentError`, `ExternalServiceError`) with HTTP status codes and safe public messages.
* **Global & Route Error Boundaries:** Provide Next.js `error.tsx` and `not-found.tsx` boundaries plus centralized error mapping in API routes so raw database/stack details never leak to clients.
* **Structured Logging & PII Redaction (`src/lib/logger.ts`):** Emit structured JSON logs (`timestamp`, `level`, `event`, `requestId`, `userId`, `durationMs`, `errorCode`). Redact sensitive fields (`OTP codes`, raw `phone_number` / `whatsapp_number` / `email` where unnecessary, `authorization` headers, webhook secrets, and raw ID/selfie file contents) from logs.

---

## 13. Security Boundaries & Hardening Rules

* **Trust Boundaries:** Validate all client inputs (`body`, `query`, `params`) and external webhook payloads on the server; never trust client-submitted subscription status, trial end dates, or star-rating aggregates.
* **Contact Privacy Enforcement:** Strip `phone_number` and `whatsapp_number` in `src/lib/contact-sanitizer.ts` whenever a provider's 1-month free trial or `₦1,000/month` subscription is expired or unpaid (**no grace period**).
* **XSS, CSRF & Injection Protection:** Rely on React's automatic output escaping, avoid `dangerouslySetInnerHTML`, use parameterized Supabase query builders (never string-concatenated SQL), and use SameSite/secure session cookies.
* **File Upload Hardening:** Restrict selfie and valid ID uploads to safe image MIME types (`image/jpeg`, `image/png`, `image/webp`) and bounded file sizes, stored in private Supabase buckets.
* **Security Headers:** Configure `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` (or frame-ancestors policy), and appropriate Content Security Policy headers in `next.config.ts`.

---

## 14. Testing, Deployment & Scalability Roadmap

### Testing Strategy

* **Unit Tests (`tests/unit/`):** Test subscription & free-trial expiration math (**zero grace period**), contact sanitization (`phone_number` and `whatsapp_number` hidden when expired/unpaid), ranking order (36-state location match + star rating), and `zod` schemas.
* **Integration Tests (`tests/integration/`):** Test `/api/webhooks/paystack` signature verification and idempotency, subscription activation after `₦1,000` payment, and rating/moderation endpoints against test/mocked data layers.
* **E2E Smoke Tests (`tests/e2e/`):** Verify core user journeys across mobile and desktop viewports: welcome screen, email OTP onboarding, selfie/ID capture, 36-state search & rating filter, active vs. hidden contact behavior, and provider subscription view.

### Deployment Pipeline

1. **Local Development:** Run Next.js dev server against local/staging Supabase project with `.env.local` configured.
2. **Preview / Staging:** Push branches/PRs to Vercel preview environments backed by a non-production Supabase project and Paystack test keys; apply database migrations before testing new schema dependencies.
3. **Production:** Merge to main branch to deploy production PWA on Vercel with production Supabase, Paystack live keys (`₦1,000/month`), and scheduled expiry check configured.

### MVP vs. Future Scale

* **Built Now (MVP v1.0):** Monolithic Next.js PWA, email OTP auth, zero-cost live selfie + ID upload, 36-state location + category + star rating search, 1-month free trial + `₦1,000/month` Paystack billing with zero grace period and automatic contact hiding, ratings, report/block, and optional free OpenRouter AI helper.
* **Deferred Until Scale / Post-MVP:** Paid automated ID/face verification APIs, native iOS/Android app store binaries, Redis caching/rate-limit stores, read replicas, background queue workers, and multi-service extraction.

```

```