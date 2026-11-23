Act as a Principal Technical Lead and Agile Project Manager responsible for executing production software development.

### CONTEXT
Before creating any plans, read and deeply understand our foundational documents in the project folder: `PRD.md`, `DESIGN.md`, `ARCHITECTURE.md`, and `DATABASE.md` (aligned with `project-brief.md`).

### TASK
Create a comprehensive `IMPLEMENTATION_PLAN.md` that breaks the entire ASAP MVP build into small, logical, sequential phases as a trackable master checklist. Do NOT write any application code or SQL scripts yet.

Structure `IMPLEMENTATION_PLAN.md` with these exact sections:
1. **Sequential Phase Strategy**
   - **Phase 0: Project Initialization:** Repository setup, `.env` configuration, approved dependencies, and tooling/PWA base setup.
   - **Phase 1: Database & Data Access:** PostgreSQL/Supabase schema migrations, Row-Level Security (RLS), private storage buckets, seed data, and service/data-access layer (`src/services/**`, `src/lib/**`, `src/types/**`).
   - **Phase 2: Core API & Auth:** Email OTP authentication, route guards/middleware, contact sanitizer (hiding phone/WhatsApp when expired/unpaid with zero grace period), and core backend API routes.
   - **Phase 3: Onboarding, Identity Capture & 1-Month Free Trial:** Welcome screen, email OTP sign-up/login, role selection, zero-cost live selfie + valid ID capture, and automatic 1-month free trial activation for service providers.
   - **Phase 4: 36-State Location Search, Star Ratings & Direct Contact:** Nigerian 36-state location picker, service category & star rating ranking, gated Call/WhatsApp contact actions, ratings, and report/block safety controls.
   - **Phase 5: Paystack Monthly Subscription (₦1,000/Month) & Zero-Grace Enforcement:** Paystack checkout initialization, webhook signature verification & idempotency, subscription status view, and automatic expiration/contact hiding with zero grace period.
   - **Phase 6: Optional AI Helper (`P1`) & Admin Moderation (`P1`):** Free-tier OpenRouter AI bio/category helper with fallback, plus `/admin` report/identity/subscription oversight.
   - **Final Phase: Polish & QA:** Loading skeletons, empty/error states, dual-theme/responsive/a11y checks, unit/integration/E2E tests, and production deployment prep.

2. **Details Required per Phase**
   For every single phase, include:
   - **Phase Goal**
   - **Prerequisites / Dependencies**
   - **Actionable Tasks** (small atomic `- [ ]` checkboxes)
   - **Target Files / Modules** (exact paths from `ARCHITECTURE.md`)
   - **Database / API Changes**
   - **Testing & Completion Criteria**

### STRICT RULES
- No application code or SQL code in `IMPLEMENTATION_PLAN.md`.
- Plan backend data/API foundations before UI slices that depend on them.
- Stay strictly within approved MVP scope (email OTP, 36 states of Nigeria, zero-cost selfie/ID capture, 1st month free then ₦1,000/month via Paystack, zero grace period, top navigation bar, dual-theme design tokens).

### OUTPUT FORMAT
Return the complete plan inside a single ```markdown ... ``` block ready to save as `IMPLEMENTATION_PLAN.md`, followed at the very end (outside the code block) by the exact prompt to execute **Phase 0, Task 1**.