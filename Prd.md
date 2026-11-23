# Product Requirements Document (PRD): ASAP

- **Document Version:** 1.1 (Updated With Confirmed Decisions)
- **Product Name:** ASAP
- **Platform Target:** Progressive Web App (PWA — mobile-first web application installable to device home screens; native iOS/Android store apps deferred to post-MVP)
- **Geographic Coverage:** All 36 states of Nigeria (plus FCT if included in location lists)
- **Primary Context:** `project-brief.md` & Confirmed Product Decisions

---

## 1. Project Overview & Executive Summary

### Problem Statement
Everyday local service needs—such as plumbing repairs, electrical work, home cleaning, carpentry, and laundry—require fast discovery and trust. Across all 36 states of Nigeria, customers often struggle to quickly find reliable, nearby service providers without asking around informally, while local service providers struggle to reach nearby customers consistently. At the same time, marketplaces that require heavy upfront fees or complex in-app escrow/booking before users can speak create friction for quick local jobs, and platforms without identity records or accountability expose users to fraud or untraceable actors.

### Value Proposition
**ASAP** provides a fast, mobile-first Progressive Web App (PWA) across all 36 states of Nigeria where everyday service providers register business profiles and nearby customers find and contact them directly via phone or WhatsApp—while keeping launch costs at zero upfront software/verification spend. Trust is supported by mandatory sign-up identity capture (live selfie + valid ID upload + free email OTP verification), star ratings, and report/block controls, while revenue is driven by a monthly service-provider subscription (**1st month free**, then **₦1,000/month** via **Paystack**, with **no grace period** and immediate automatic contact hiding when unpaid/expired).

### Target Users & Personas
1. **Service Provider (Helper):** Local tradespeople and service workers (plumbers, electricians, cleaners, carpenters, laundry helpers, and other everyday community service providers across the 36 states) who want a business profile, local visibility, and incoming calls or WhatsApp messages from nearby customers—starting with a **1-month free trial**, then paying **₦1,000/month** via **Paystack**.
2. **Customer:** Everyday community members and residents across the 36 states who want to sign up, select their location, search for nearby service providers sorted by location relevance and star rating, and reach out directly via phone or WhatsApp to negotiate details and settle payment offline.
3. **Platform Operator / Admin (Internal Oversight):** The product owner/operator who monitors platform health, payment webhooks, and reported accounts/safety flags without having to manually approve every standard sign-up or manually toggle contact visibility.

### Approved Tech Stack
- **Frontend & PWA:** Next.js with TypeScript (mobile-first UI, Web App Manifest, and service worker/PWA support).
- **Backend:** Node.js (via Next.js server routes / server actions for business logic, trial/subscription enforcement, Paystack webhook processing, and API orchestration).
- **Database & File Storage:** Supabase (relational database for users, provider profiles, locations across the 36 states, ratings, subscriptions, and reports; access-controlled storage buckets for selfies and ID documents).
- **AI Layer:** OpenRouter API using free-tier / zero-cost models (optional assistance features such as helping providers draft clear service descriptions or helping customers refine service searches).
- **Payments & Hosting:** **Paystack** for monthly provider subscriptions (**₦1,000/month** after the **1-month free** period; per-transaction gateway fee with no fixed monthly platform fee) and free starter web hosting (such as Vercel).

---

## 2. Core User Journeys & User Stories

### End-to-End Flows

#### Flow A: New User Onboarding & Identity Capture (Customer or Service Provider)
1. User opens the ASAP PWA URL on a mobile or desktop browser and views the welcome screen.
2. User taps to sign up or log in, choosing whether they are registering as a **Customer** or a **Service Provider**.
3. User enters their email address (and contact details) and completes **email OTP (One-Time Password)** verification at zero upfront cost.
4. User completes profile details (name, state/location across Nigeria's 36 states, and—if a Service Provider—service category, business name, description, and phone/WhatsApp contact).
5. User captures a **live selfie** (camera face capture) and uploads a **valid ID card** photo without paying an upfront verification fee.
6. System stores the profile, selfie, and ID record, grants Service Providers their **1-month free** introductory period automatically, and routes the user into the main app experience.

#### Flow B: Location Selection, Service Discovery & Direct Contact (Customer)
1. Authenticated customer selects or confirms their location across Nigeria's **36 states** (and local area/zone).
2. Customer searches or filters for a needed service category (e.g., plumber, electrician, cleaner, carpenter, laundry).
3. System returns matching service providers near the customer's selected location, ordered by location relevance and **star rating**.
4. Customer opens a service provider's profile card/detail view.
5. **Subscription & Trial Gate Check:**
   - If the provider's **1-month free period** or **₦1,000/month Paystack subscription** is currently **active** (not expired), the customer sees their phone and/or WhatsApp contact actions and can call or open WhatsApp directly to negotiate scope and settle payment privately off-platform.
   - If the provider's free period or paid month has **expired / is unpaid** (with **no grace period**), contact details (phone and WhatsApp) are **hidden automatically**, and the customer sees a clear notice that contact details are currently unavailable.

#### Flow C: Monthly Subscription Payment & Immediate Auto-Hide (Service Provider)
1. Service provider views their trial or **₦1,000/month** subscription status inside their dashboard/subscription screen.
2. Provider initiates monthly subscription payment (**₦1,000**) via **Paystack**.
3. Paystack confirms successful payment via webhook/verification callback.
4. Backend updates the provider's subscription status to **active** with a new monthly billing period end date; phone and WhatsApp contacts remain/become visible to customers.
5. When the 1-month free period or a paid monthly period expires without payment—with **no grace period**—the system's automated scheduled check and status enforcement immediately mark the subscription **expired/inactive** and hide the provider's phone and WhatsApp contact details from customer views until payment succeeds.

#### Flow D: Rating & Reporting (Customer)
1. After interacting with or viewing a provider, an authenticated customer can submit a **star rating** (1 to 5 stars) and optional short feedback, or tap **Report / Block** if they encounter fraudulent, abusive, or misleading behavior.
2. System recalculates the provider's average star rating and displays updated rating signals in search results.

---

### User Stories & Acceptance Criteria

#### US-01: Welcome Screen & PWA Access
> **As a** first-time visitor, **I want to** open ASAP in my browser, see a clear welcome message, and install it to my home screen as a PWA, **so that** I can access it quickly like a mobile app without visiting an app store.

- **Acceptance Criteria:**
  - Opening `/` or the entry screen displays a clear ASAP welcome message explaining how customers and local service providers connect.
  - The app includes a valid PWA web app manifest and service worker so supported mobile browsers can install/add ASAP to the home screen.
  - Navigation remains responsive and usable on mobile screens without horizontal overflow.

#### US-02: Email OTP Sign-Up & Role Selection
> **As a** new user, **I want to** sign up using my email with a free OTP verification code and choose whether I am a Customer or Service Provider, **so that** my account is verified at zero upfront cost and my role matches my intent.

- **Acceptance Criteria:**
  - User can request and verify an **email OTP** during registration at zero upfront SMS cost.
  - Invalid, expired, or mistyped OTP codes are rejected with a clear error message.
  - User selects a role (**Customer** or **Service Provider**) and cannot bypass required profile fields.

#### US-03: Zero-Cost Selfie & Valid ID Capture on Sign-Up
> **As a** user registering on ASAP, **I want to** snap a live selfie of my face and upload a photo of my valid ID card during sign-up without paying a verification fee, **so that** identity records exist for traceability at zero upfront cost.

- **Acceptance Criteria:**
  - Sign-up flow provides a live camera selfie capture step and a valid ID image upload step.
  - No third-party paid face-match or paid ID-verification API is called during MVP sign-up.
  - Uploaded selfie and ID files are stored in Supabase storage linked to the user's account record, with file type and size validation enforced.

#### US-04: 36-State Location Selection & Nearby Service Search Ranked by Rating
> **As a** customer, **I want to** select my location across Nigeria's 36 states and search for nearby services ranked by location and star rating, **so that** I can quickly find relevant, well-rated local providers nearest to me.

- **Acceptance Criteria:**
  - Customer can select or update their location from **all 36 states of Nigeria** (plus area/zone) and filter/search by service category or keyword.
  - Search results prioritize providers matching the selected location and rank by **star rating** (highest average rating first, with deterministic tie-breakers).
  - Each result card displays provider name, service category, location/state, average star rating, rating count, and contact availability status.

#### US-05: Direct WhatsApp/Phone Contact & Zero-Grace-Period Contact Hiding
> **As a** customer, **I want to** view a provider's phone or WhatsApp contact when their free first month or ₦1,000/month subscription is active and see it hidden immediately when expired/unpaid, **so that** I can reach active providers directly while expired/unpaid listings never expose contact details.

- **Acceptance Criteria:**
  - When a service provider is within their **1-month free** period or has an active **₦1,000/month** subscription (`period_end > now`), their phone call link and/or WhatsApp chat link are displayed.
  - When a service provider's free month or paid month has expired (`period_end <= now`) or is unpaid—with **no grace period**—phone numbers and WhatsApp links/numbers are **not rendered** in customer-facing responses or UI.
  - Subscription expiration and contact hiding happen automatically via scheduled backend checks and Paystack webhook updates without manual per-user admin toggling.

#### US-06: 1-Month Free Trial & ₦1,000/Month Paystack Subscription
> **As a** service provider, **I want to** get my first month free upon registration and then pay **₦1,000/month** through **Paystack**, **so that** my contact details remain visible to nearby customers after my free month ends.

- **Acceptance Criteria:**
  - Newly registered service providers receive a **1-month free** active window automatically.
  - Service providers can pay **₦1,000/month** via **Paystack** checkout.
  - Confirmed Paystack payments extend the active subscription period by one month; once any active period ends without renewal, there is **no grace period** and contacts are automatically hidden.

#### US-07: Star Ratings, Reporting & Blocking
> **As a** customer, **I want to** leave a star rating and report or block a user or provider if something is wrong, **so that** the community has trust signals and a way to flag bad actors.

- **Acceptance Criteria:**
  - Authenticated customers can submit a star rating (1–5) on a service provider profile, updating the provider's displayed rating summary.
  - Users can submit a report (with reason) against a provider or user, persisting the report record for operator review.
  - Users can block another user so that blocked content/interactions are hidden for the blocking user.

#### US-08: Optional Free AI Helper Assistance
> **As a** service provider or customer, **I want to** optionally use an AI helper powered by a free OpenRouter model to polish a service description or clarify what service I need, **so that** listings are clear and searches are easier without incurring AI API charges.

- **Acceptance Criteria:**
  - AI assistance is invoked only on explicit user action and uses a free-tier OpenRouter model.
  - If OpenRouter is unavailable, rate-limited, or returns an error, core search, profile, and contact flows continue working normally with a non-blocking fallback notice.

---

## 3. Features & Functional Requirements

| ID | Feature / Requirement | Priority | Business Rules, Validation & Edge Cases |
| :--- | :--- | :--- | :--- |
| **FR-01** | **Welcome & Onboarding Entry** | `P0 - Must Have for MVP` | Displays welcome screen after initial load; routes authenticated users to home/search or provider workspace and unauthenticated visitors to sign-in/sign-up. |
| **FR-02** | **Email OTP Authentication** | `P0 - Must Have for MVP` | Uses email OTP verification at zero upfront SMS cost; enforces valid email format, OTP expiration window, attempt limits, and resend cooldown. |
| **FR-03** | **Role & Profile Management** | `P0 - Must Have for MVP` | Every user selects `customer` or `provider`. Providers must supply service category, state (across Nigeria's 36 states) & area, business/display name, and phone/WhatsApp number. |
| **FR-04** | **Live Selfie & ID Card Capture** | `P0 - Must Have for MVP` | Captures live camera image for selfie and accepts image upload for valid ID card. Validates MIME type (JPEG/PNG/WebP) and max file size. Zero paid verification API calls in MVP. |
| **FR-05** | **36-State Location Selection & Service Search** | `P0 - Must Have for MVP` | Supports all **36 states of Nigeria** (plus optional area/zone) and service category/keyword filtering. Handles zero-match locations gracefully. |
| **FR-06** | **Rating & Location Ranking** | `P0 - Must Have for MVP` | Sorts providers by location match first, then average star rating descending. Unrated providers display "No ratings yet" and sort after rated providers within the same location tier. |
| **FR-07** | **Direct WhatsApp & Call Actions** | `P0 - Must Have for MVP` | Generates direct `tel:` and `https://wa.me/...` links only when the provider's free 1st month or paid ₦1,000/month subscription is currently active. |
| **FR-08** | **1-Month Free Trial, ₦1,000/Month Plan & Zero-Grace Auto-Hide** | `P0 - Must Have for MVP` | Grants 1st month free on provider onboarding; charges **₦1,000/month** thereafter. **No grace period**: scheduled backend jobs + real-time/webhook checks automatically set expired subscriptions to inactive/expired and hide phone/WhatsApp contacts immediately. |
| **FR-09** | **Paystack Payment Integration** | `P0 - Must Have for MVP` | Integrates **Paystack** for **₦1,000/month** payments (per-transaction fee only, no fixed monthly platform fee). Verifies payment server-side via webhook/callback before extending active period; enforces webhook idempotency. |
| **FR-10** | **Star Ratings & Reviews** | `P0 - Must Have for MVP` | Enforces 1–5 integer star rating. Prevents self-rating. Updates average rating and review count consistently. |
| **FR-11** | **Report & Block Safety Controls** | `P0 - Must Have for MVP` | Allows submitting a report category + note and blocking a user. Blocked users are hidden from the blocker's active search/contact flow; reports are stored for operator review. |
| **FR-12** | **PWA Manifest & Offline Shell** | `P0 - Must Have for MVP` | Provides PWA manifest (`name`, `short_name`, `start_url`, `display: standalone`, icons) and caches static shell assets; shows clear offline status when network drops. |
| **FR-13** | **Free AI Text / Discovery Helper (OpenRouter)** | `P1 - Important` | Calls OpenRouter free-tier model via backend route to suggest/polish provider profile bio or map a problem description to a service category. Sanitizes output and enforces rate limits. |
| **FR-14** | **Basic Admin Moderation & Payment Oversight View** | `P1 - Important` | Protected admin view to inspect reported accounts, view submitted ID/selfie records for investigation if needed, and inspect subscription/Paystack webhook records. |
| **FR-15** | **Automated Face-to-ID Verification & Native App Store Builds** | `P2 - Future/Nice-to-Have` | Paid biometric/ID verification APIs, in-app chat/escrow payments, and native iOS App Store / Google Play Store releases are explicitly deferred beyond MVP. |

---

## 4. Pages, Screens & Navigation Flow

| Route / Screen | Purpose & Core Components | Navigation & Links |
| :--- | :--- | :--- |
| `/` (Welcome & Landing) | Welcome message for ASAP, value summary for customers & service providers across Nigeria's 36 states, PWA install prompt/hint, and primary CTAs ("Get Started" / "Sign In"). | Links to `/auth/signup`, `/auth/login`, or directly to `/explore` if already signed in. |
| `/auth/signup` (Sign Up & Role Selection) | Role selector (`Customer` vs. `Service Provider`), email input, free email OTP request & verification step, and basic profile fields. | Links to `/auth/login`; advances to `/onboarding/kyc-capture` upon email OTP verification. |
| `/auth/login` (Sign In) | Email input + free email OTP login flow for returning users. | Links to `/auth/signup`; routes to `/explore` (Customer) or `/provider/dashboard` (Service Provider). |
| `/onboarding/kyc-capture` (Selfie & ID Capture) | Live camera selfie capture widget, valid ID card image uploader, state (from Nigeria's 36 states) & area selector, service provider business/WhatsApp details (for providers), and submit action. | Advances to `/explore` for Customers or `/provider/dashboard` (with 1-month free trial active) for Service Providers. |
| `/explore` (Location & Service Search) | State (36 states) & area selector, service category filter & search bar, rating filter/sort, and list of matching provider cards showing rating and contact availability. | Tapping a provider card opens `/providers/[id]`; top/bottom nav links to `/profile` or `/provider/dashboard`. |
| `/providers/[id]` (Provider Detail & Contact) | Provider photo, business name, category, state/area, average star rating, rating count, direct Call & WhatsApp buttons (**only** if trial or ₦1,000/month subscription is active with no grace period elapsed; hidden with status notice if expired/unpaid), rating form, and Report/Block actions. | Back to `/explore`; external links (`tel:`, `https://wa.me/...`) when active. |
| `/provider/dashboard` (Provider Workspace) | Provider profile summary, subscription status badge (`Free 1st Month Active`, `Paid Active (₦1,000/mo)`, or `Expired / Contacts Hidden`), quick link to pay **₦1,000** via **Paystack**, optional AI description helper trigger, and rating summary. | Links to `/provider/subscription` and `/profile`. |
| `/provider/subscription` (Monthly Subscription & Paystack Billing) | Shows 1-month free trial status and **₦1,000/month** plan details, zero-grace-period policy notice, **Paystack** checkout button, and payment history status. | Returns to `/provider/dashboard` after Paystack callback/webhook confirmation. |
| `/profile` (Account, Location & Safety) | User profile info, saved state/location preference, blocked users list with unblock option, report submission access, and sign-out action. | Links to `/explore` or `/provider/dashboard`. |
| `/admin` (Operator Moderation & Logs — `P1`) | Restricted view for platform operator to review reported users/providers, inspect captured selfie/ID files during investigations, and check subscription/Paystack webhook logs. | Accessible only to `admin` role; redirects unauthorized users to `/explore`. |

---

## 5. Roles, Authentication & Permissions

### Roles
- **Guest (Unauthenticated):** Has not completed email OTP session sign-in.
- **Customer (Authenticated):** Registered user searching services across Nigeria's 36 states, rating providers, and reporting/blocking users.
- **Service Provider (Authenticated):** Registered local service worker offering services, starting with a 1-month free trial and renewing at **₦1,000/month** via **Paystack**, and receiving customer inquiries via phone/WhatsApp while active.
- **Admin (Privileged Operator):** Internal platform owner/moderator with oversight access to reports, investigation records, and subscription/payment status.

### Access-Control Matrix

| Resource / Action | Guest | Customer | Service Provider | Admin |
| :--- | :--- | :--- | :--- | :--- |
| **Welcome screen (`/`)** | View | View | View | View |
| **Email OTP Sign-Up & Selfie/ID Upload** | Create (own account) | View own profile | View own profile | View metadata / investigation records |
| **Service Provider Directory & Search (36 States)** | Limited preview (no direct contact) | View active listings; contacts shown only if provider trial/subscription is active | View active listings | View all listings & subscription states |
| **Provider Phone & WhatsApp Contact** | Hidden | View **only** when provider trial or ₦1,000/month subscription is active (no grace period) | View own contact settings | View for support/audit |
| **1-Month Free Trial & ₦1,000/Month Paystack Payment** | N/A | N/A | Receive 1st month free; pay/renew **₦1,000/month** via Paystack | View subscription & payment status |
| **Star Ratings (1–5)** | View | Create / update own rating on providers | View own received ratings | View & moderate if flagged |
| **Report & Block Actions** | N/A | Create own reports & blocks; manage own block list | Create own reports & blocks; manage own block list | View all reports & take moderation action |
| **AI Helper (OpenRouter)** | N/A | Use search/category helper | Use profile/description helper | Use / monitor usage |

---

## 6. Data Requirements & Core Entities

1. **User (`users`)**
   - Core attributes: unique identifier, `role` (`customer` | `provider` | `admin`), email, optional phone number, email OTP verification status, state/location, `is_blocked_by_system` flag, created/updated timestamps.
   - Relationships: Has one `ProviderProfile` (if `role = provider`), many `Rating` records (as author), many `Report` records (as reporter or reported target), and many `UserBlock` records.

2. **IdentityRecord (`identity_records`)**
   - Core attributes: unique identifier, `user_id` (reference to `User`), `selfie_storage_path`, `id_document_storage_path`, `id_type` (e.g., NIN, Voter's Card, Driver's License, International Passport), `capture_status` (`submitted` | `flagged` | `reviewed`), `submitted_at`.
   - Relationships: Belongs to one `User`. Stored in access-controlled storage; never publicly browsable.

3. **ProviderProfile (`provider_profiles`)**
   - Core attributes: unique identifier, `user_id` (reference to `User`), `business_name`, `service_category`, `service_description`, `state` (one of Nigeria's 36 states), `location_area`, `phone_number`, `whatsapp_number`, `average_rating`, `rating_count`, updated timestamp.
   - Relationships: Belongs to one `User`; has many `Subscription` records and many `Rating` records.

4. **Subscription (`subscriptions`)**
   - Core attributes: unique identifier, `provider_