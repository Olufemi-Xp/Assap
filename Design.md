# Design System & UI Architecture (`DESIGN.md`): ASAP

- **Document Version:** 1.0 (MVP Baseline)
- **Product Name:** ASAP
- **Visual Direction:** Adaptive Dual-Theme Slate & Trust Teal (Combination of Option A & Option C)
- **Navigation Pattern:** Top Navigation Bar on both mobile and desktop viewports
- **Density & Card Style:** Balanced, scannable layout—attractive, structured cards with clear hierarchy and generous tap targets without wasted whitespace
- **Aligned With:** `project-brief.md`, `PRD.md`, and confirmed decisions (Email OTP first, 36 states of Nigeria coverage, 1-month free trial for new service providers, ₦1,000/month via Paystack thereafter, zero grace period / immediate contact hiding when expired or unpaid, zero-cost live selfie + valid ID capture at sign-up, location + service category + star rating ranking)

---

## 1. Visual Direction & Design Principles

### Aesthetic Philosophy & Brand Personality
**ASAP** combines crisp daylight utility and high-trust clarity with an adaptive slate surface system that supports both light and dark modes (`System / Dual Theme`). Designed as a mobile-first Progressive Web App (PWA) for customers and local service providers across all 36 states of Nigeria, the interface feels dependable, fast, and easy to read on phone screens in bright daylight or at night.

### Core UX Principles
1. **Clarity Over Decoration:** Every color, badge, and spacing token serves a functional purpose—helping users immediately spot location, service category, star rating, and whether a provider's phone or WhatsApp contact is active or hidden.
2. **Unambiguous Subscription & Contact State:** A service provider's active trial or paid `₦1,000/month` subscription state must be unmistakable. When expired or unpaid (with zero grace period), contact controls (`Call` and `WhatsApp`) are completely absent from customer views and replaced by clear status messaging.
3. **Balanced Card Scannability:** Cards present key scan points (name/business, service category, state/area, star rating, and subscription/contact status) in a balanced structure that avoids cramped walls of text while keeping vertical scrolling efficient on mobile.
4. **Low-Friction Onboarding & Accessibility:** Large `44x44px` minimum tap targets, clear step indicators, inline field validation, and smooth camera/file capture fallbacks ensure first-time users and everyday service providers can complete flows without confusion.
5. **Dual-Theme Readability:** Both light and dark tokens maintain strong text-to-background contrast so outdoor sunlight glare and low-light mobile viewing remain comfortable.

### Anti-Patterns (What to Avoid)
- **No generic AI SaaS clichés:** Do not use neon purple-to-blue gradients, floating glowing orbs/blobs, glassmorphism blur clutter, or overly decorative marketing illustrations that slow down task completion.
- **No inconsistent radii or ad-hoc colors:** Never invent random hex values or mix sharp `0px` corners with `28px` pill-cards inside the same component group; always use the semantic tokens in Section 2.
- **No fake/leaked contact controls:** Never render disabled or blurred phone numbers/WhatsApp links for expired/unpaid providers; enforce hiding at both the API/data and UI layers.
- **No cluttered cards:** Do not pack secondary metadata, tag clouds, and promotional banners inside individual search result cards.

---

## 2. Color System & Semantic Tokens

ASAP supports **Light** and **Dark** themes (defaulting to system preference with an optional theme toggle in account/header).

### Backgrounds & Surfaces

| Semantic Token | Light Mode Hex | Light Mode RGB | Dark Mode Hex | Dark Mode RGB | Usage Scope |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `--bg-canvas` | `#F8FAFC` | `248, 250, 252` | `#090D16` | `9, 13, 22` | Primary page & app background |
| `--bg-surface` | `#FFFFFF` | `255, 255, 255` | `#111827` | `17, 24, 39` | Cards, panels, and elevated containers |
| `--bg-surface-subtle` | `#F1F5F9` | `241, 245, 249` | `#1E293B` | `30, 41, 59` | Secondary pills, grouped rows, filter strips |
| `--bg-hover` | `#E2E8F0` | `226, 232, 240` | `#273549` | `39, 53, 73` | Hover/press fill on interactive rows or secondary buttons |
| `--bg-overlay` | `#0F172A` (at 55% opacity) | `15, 23, 42` | `#020617` (at 70% opacity) | `2, 6, 23` | Modal and bottom/slide-over sheet backdrop |

### Typography Colors

| Semantic Token | Light Mode Hex | Dark Mode Hex | Usage Scope |
| :--- | :--- | :--- | :--- |
| `--text-primary` | `#0F172A` | `#F8FAFC` | Headings, provider names, primary prices (`₦1,000`), key labels |
| `--text-secondary` | `#475569` | `#94A3B8` | Descriptions, location/area labels, supporting copy |
| `--text-muted` | `#64748B` | `#64748B` | Captions, timestamps, placeholders, subtle helper hints |
| `--text-inverted` | `#FFFFFF` | `#090D16` | Text on solid primary accent or high-contrast badges |

### Accents, Brand & Borders

| Semantic Token | Light Mode Hex | Dark Mode Hex | Usage Scope |
| :--- | :--- | :--- | :--- |
| `--accent-primary` | `#0F766E` | `#2DD4BF` | Primary buttons, active navigation state, brand trust anchor |
| `--accent-primary-hover` | `#115E59` | `#14B8A6` | Hover state for primary interactive elements |
| `--accent-primary-active` | `#134E4A` | `#0D9488` | Active/pressed state for primary buttons |
| `--accent-secondary` | `#1D4ED8` | `#60A5FA` | Secondary informational links, selection highlights |
| `--border-subtle` | `#E2E8F0` | `#1E293B` | Default hairline borders on cards, dividers, and inputs |
| `--border-focus` | `#0F766E` | `#2DD4BF` | Focused input borders and visible keyboard focus outlines |

### Semantic Status Colors

| Status | Background Tint (Light / Dark) | Border Hex (Light / Dark) | Text & Icon Hex (Light / Dark) | Meaning in ASAP |
| :--- | :--- | :--- | :--- | :--- |
| **Success** | `#DCFCE7` / `#052E16` | `#86EFAC` / `#166534` | `#15803D` / `#4ADE80` | Active trial or paid `₦1,000/mo` subscription; OTP verified; payment confirmed |
| **Warning** | `#FEF3C7` / `#451A03` | `#FCD34D` / `#92400E` | `#B45309` / `#FBBF24` | Star rating highlight, trial ending soon reminder, or AI fallback notice |
| **Danger / Error** | `#FEE2E2` / `#450A0A` | `#FCA5A5` / `#991B1B` | `#B91C1C` / `#F87171` | Expired/unpaid contact hidden notice, invalid OTP, report/block alert, form error |
| **Info** | `#DBEAFE` / `#172554` | `#93C5FD` / `#1E40AF` | `#1D4ED8` / `#93C5FD` | Location filter info, PWA install guidance, step instructions |

---

## 3. Typography System

### Font Families
- **Heading Font (`--font-heading`):** `'Plus Jakarta Sans'`, `'Space Grotesk'`, `-apple-system`, `BlinkMacSystemFont`, `'Segoe UI'`, sans-serif.
- **Body Font (`--font-body`):** `'Inter'`, `-apple-system`, `BlinkMacSystemFont`, `'Segoe UI'`, sans-serif.
- **Monospace Font (`--font-mono`):** `'JetBrains Mono'`, `'IBM Plex Mono'`, `ui-monospace`, `SFMono-Regular`, Menlo, monospace (used for OTP codes, payment references, ID labels, and technical metadata).

### Type Scale

| Level | Desktop Size (`rem` / `px`) | Mobile Size (`rem` / `px`) | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | `2.25rem` (`36px`) | `1.75rem` (`28px`) | `700` (Bold) | `1.15` | `-0.025em` |
| **H1** | `1.75rem` (`28px`) | `1.375rem` (`22px`) | `700` (Bold) | `1.2` | `-0.02em` |
| **H2** | `1.375rem` (`22px`) | `1.125rem` (`18px`) | `600` (SemiBold) | `1.3` | `-0.015em` |
| **H3** | `1.125rem` (`18px`) | `1rem` (`16px`) | `600` (SemiBold) | `1.35` | `-0.01em` |
| **H4** | `1rem` (`16px`) | `0.9375rem` (`15px`) | `600` (SemiBold) | `1.4` | `0em` |
| **Body Large** | `1.0625rem` (`17px`) | `1rem` (`16px`) | `400` (Regular) | `1.55` | `-0.005em` |
| **Body Default** | `0.9375rem` (`15px`) | `0.9375rem` (`15px`) | `400` (Regular) | `1.5` | `0em` |
| **Small / Caption** | `0.8125rem` (`13px`) | `0.8125rem` (`13px`) | `500` (Medium) | `1.4` | `0.005em` |
| **Micro / Label** | `0.75rem` (`12px`) | `0.75rem` (`12px`) | `600` (SemiBold) | `1.25` | `0.03em` |

### Readability & Numeric Rules
- **Line Measure:** Limit long-form prose and descriptions to `55–70ch` so lines remain effortless to scan on both phones and wide screens.
- **Tabular Numerals:** Apply `font-variant-numeric: tabular-nums` on star ratings (e.g., `4.8`), review counts (`(32)`), currency amounts (`₦1,000`), OTP countdowns, and subscription expiration dates so figures align cleanly without jitter.

---

## 4. Spacing, Layout Grid & Elevation System

### Spatial Scale (Base Unit: `4px` / `0.25rem`)
- Core spacing steps: `4px` (`1`), `8px` (`2`), `12px` (`3`), `16px` (`4`), `20px` (`5`), `24px` (`6`), `32px` (`8`), `40px` (`10`), `48px` (`12`).
- **Balanced Card Rhythm:**
  - Card internal padding: `16px` (`p-4`) on mobile, `18px–20px` on desktop.
  - Vertical gap between stacked cards: `12px` (`gap-3`) to `16px` (`gap-4`).
  - Internal element gap inside a card: `8px` (`gap-2`) to `12px` (`gap-3`).

### Containers & Grid
- **Page Container:** Max-width `1200px` centered (`mx-auto`), with horizontal side padding `16px` on `<640px`, `24px` on `640px–1023px`, and `32px` on `1024px+`.
- **Focused Onboarding / Auth / Subscription Forms:** Max-width `520px` centered inside the page container for single-task clarity.
- **Discovery List / Grid (`/explore`):** Single-column stack on mobile (`<768px`), 2-column grid on tablet (`768px–1023px`), and 2-to-3 column grid on desktop (`1024px+`) with `16px` gutters.

### Border Radius Scale
- **Badges, Pills & Status Tags:** `9999px` (full pill) for status chips and category/rating filter pills; `8px` for compact inline tags.
- **Inputs & Buttons:** `12px` (`rounded-xl`) for text inputs, selects, OTP boxes, and action buttons.
- **Cards & Containers:** `16px` (`rounded-2xl`) for provider cards, summary panels, and form sections.
- **Modals & Sheets:** `20px` (`rounded-[20px]`) on desktop modals and top corners of mobile bottom sheets.

### Depth & Elevation
- **Primary Separation:** Crisp `1px` border using `--border-subtle` (`#E2E8F0` light / `#1E293B` dark).
- **Subtle Elevation (Cards & Sticky Header):**
  - Light card resting shadow: `0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px rgba(15, 23, 42, 0.03)`.
  - Elevated modal/popover shadow: `0 12px 28px rgba(15, 23, 42, 0.12)`.
  - Dark mode avoids heavy drop shadows and relies on surface contrast (`#090D16` → `#111827` → `#1E293B`) plus crisp `1px` borders.

---

## 5. Reusable Component Specifications

### Buttons (`44px` minimum height for primary/secondary/outline/destructive actions)
- **Variants:**
  - `Primary`: Solid `--accent-primary` fill, `--text-inverted` text, no border. Used for main actions ("Get Started", "Verify OTP", "Pay ₦1,000 with Paystack", "WhatsApp Provider").
  - `Secondary`: Soft `--bg-surface-subtle` fill, `--text-primary` text, subtle border. Used for supporting actions ("Call Provider", "View Details").
  - `Outline`: Transparent/surface background with `1px` `--border-subtle` (or `--accent-primary` for emphasized outline), `--text-primary` text.
  - `Ghost`: Transparent fill, `--text-secondary` text; shifts to `--bg-surface-subtle` and `--text-primary` on hover.
  - `Destructive`: Danger tint or solid danger accent (`#B91C1C` light / `#DC2626` dark) with clear label ("Report", "Block User", "Sign Out").
- **States:**
  - `Default`: Standard fill, text, and border.
  - `Hover`: Darkens/lightens surface token (`--accent-primary-hover` or `--bg-hover`).
  - `Focus`: `2px` solid focus ring offset by `2px` in `--border-focus`.
  - `Active`: Slightly compressed/pressed token (`--accent-primary-active`).
  - `Disabled`: `50%` opacity, `cursor: not-allowed`, non-interactive.

### Cards & Containers
- **Standard Card:** `--bg-surface` fill, `1px solid --border-subtle`, `16px` radius, `16px` padding.
- **Interactive Provider Card:** Adds hover border/surface shift (`--bg-hover` or `--accent-primary` subtle highlight) and cursor pointer across the card body while keeping nested action links distinct and accessible.
- **States:** `Default`, `Hover`, `Focus-Within`, `Selected/Active` (for selectable role cards or state/category options).

### Badges, Pills & Status Indicators
- **Subscription Status Pill:**
  - `Active (Trial / Paid)`: Success semantic tokens (`Active · Free Month` or `Active · Paid`).
  - `Contact Hidden (Expired / Unpaid)`: Danger semantic tokens (`Contact Hidden`)—immediately signals no grace period active.
- **Rating Pill:** Compact indicator showing star icon + rating value (`★ 4.7 (18)`) or `New` when unrated.
- **Category / Filter Chip:** Toggleable pill (`36px–40px` touch-friendly height, `≥44px` hit area if standalone button) with active `--accent-primary` highlight when selected.

### Modals, Drawers & Confirmation Dialogs
- **Behavior:** Centered dialog on desktop (`max-w-[460px]`) and slide-up sheet on mobile (`max-h-[85vh]`, scrollable body) for state/area selection, report submission, block confirmation, and AI suggestion preview.
- **States:** `Closed`, `Opening/Closing` (`200ms`), `Open` (traps focus inside dialog, closes on backdrop click or `Escape` key when not mid-submission).

### Lists & Data Display Items
- **Provider Search List:** Clean cards displaying business/provider name, service category, state & area across Nigeria's 36 states, star rating, subscription/contact availability badge, and concise 1–2 line summary.
- **Activity / Subscription History Rows:** Key-value rows showing billing period, amount (`₦1,000`), reference, and status without wide multi-column tables that overflow on mobile.

### Toast Notifications & Alerts
- **Inline Banner Alert:** Placed inside forms or dashboards for persistent states (e.g., expired subscription hiding contact details, offline status, AI fallback notice).
- **Toast Notification:** Positioned top-right on desktop or above bottom/top safe area on mobile (`auto-dismiss` after `4–5s` for confirmation messages; persistent or retry-enabled for errors).

---

## 6. Navigation & Form UX Rules

### Top Navigation Bar (Mobile & Desktop)
- **Structure:** Sticky top bar (`height: 60px` on mobile, `64px` on desktop) spanning full width over `--bg-surface` with a `1px` `--border-subtle` bottom border.
- **Left:** **ASAP** brand mark + wordmark linking to `/` (or `/explore` when signed in).
- **Center / Right (Desktop & Mobile):**
  - Compact, high-priority navigation links: **Explore** (`/explore`), **Dashboard** (`/provider/dashboard` for providers) or **Profile** (`/profile`), and **Subscription** (`/provider/subscription` for providers), plus **Sign In / Get Started** when signed out.
  - On narrow mobile screens (`360px–430px`), keep top-bar items concise (brand + 2–3 short labels/icons with `≥44px` tap targets) so nothing wraps onto multiple lines or overflows horizontally.
- **Active Route Indicator:** Active link displays `--accent-primary` text/icon plus a clear bottom/pill active indicator; `aria-current="page"` is set on the active link. Breadcrumbs are omitted on flat top-level routes and used only on deep detail/admin sub-views if needed.

### Form UX Standards
- **Input Height:** `44px–48px` (`h-11` / `h-12`) with `12px` border radius and `14px–16px` horizontal padding.
- **Labels & Helper Text:** Every input has an explicit visible `<label>` above the field (never placeholder-only labels) and concise helper copy underneath when format rules apply (e.g., WhatsApp number format, valid ID types, or zero-grace-period billing note).
- **Validation Timing:** Validate format on blur and on form submit; clear error messages immediately as the user edits invalid fields.
- **Required Fields & Submit Behavior:** Mark required fields clearly (`*` or helper note); disable submit button and show loading state while OTPs, camera/ID files, or Paystack checkouts are processing.

---

## 7. UI Feedback States (Loading, Empty & Error States)

### Loading States
- **Skeleton Shimmer:** Provider lists on `/explore` and detail views on `/providers/[id]` render skeleton placeholders matching card height, avatar dimensions, and text line counts so Cumulative Layout Shift (CLS) stays near zero.
- **Action Spin