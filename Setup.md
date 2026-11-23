# ASAP Beginner-Friendly Setup & Authentication Guide

This guide explains how to configure and run the ASAP web application from scratch, complete with real Supabase Authentication, Google OAuth, Email OTP verification, and Paystack subscriptions.

---

## Technical terms explained in everyday language

* **Terminal or Command Prompt:** The text window on your computer where you run simple text instructions.
* **Node.js:** The background engine that reads and runs our TypeScript/JavaScript web application code.
* **Environment variables (`.env.local`):** A secret note file that stays on your computer holding private passwords and API keys so you never publish them by accident.
* **API keys:** Digital passcodes that allow our web application to talk securely with external services like Supabase and Paystack.
* **Supabase:** Our cloud database and security headquarters that stores user logins, provider profiles, ratings, and files.
* **Row Level Security (RLS):** Database security guard rules in Supabase ensuring that normal users can only see public records and can only edit their own personal data.
* **Google OAuth:** A secure Google sign-in system that allows customers and providers to log in with one click without creating a new password.
* **Email One-Time Password (OTP):** A 6-digit numeric verification code sent to a user's email address to verify identity at zero SMS cost.
* **Paystack:** A trusted Nigerian payment processor used for provider subscriptions (₦1,000/month after the initial 30-day free trial).
* **Zero Grace Period:** If a provider does not renew their ₦1,000 monthly subscription when their trial or period ends, their contact buttons (Call & WhatsApp) are immediately hidden from public view until renewed.

---

## Core product rules

* **Zero-cost identity capture:** Users capture a live camera selfie and upload a valid government ID (NIN slip, voter card, driver license, or passport).
* **Coverage across all 36 states:** The location selector covers every state in Nigeria plus the Federal Capital Territory (FCT).
* **First month free trial:** Every verified service provider receives 30 days without charge upon registration.
* **₦1,000 monthly subscription:** Providers pay ₦1,000 each month via Paystack to keep their contacts visible.
* **Immediate contact hiding:** If a provider does not renew upon expiration, contact buttons are hidden right away.

---

## Step 1: Gather your Supabase API keys and URL

1. Open your browser and go to [database.new](https://database.new) or sign in to your dashboard at [supabase.com](https://supabase.com).
2. Create or select your **ASAP** project.
3. In the left navigation menu, click the gear icon (**Project Settings**).
4. Click on **Data API** (or **API Keys** depending on your Supabase dashboard version).
5. Copy down these three values:
   * **Project URL:** Looks like `https://abcdefghijklmnopqrst.supabase.co`
   * **Publishable / Anon key:** A long public token starting with `eyJhb...`
   * **Service Role key (`secret`):** A confidential administrative token used strictly on the server for automated tasks (keep this secret).

---

## Step 2: Add keys to your local environment file

1. Open your terminal and navigate to the project directory:
   ```powershell
   cd C:\Users\user\Documents\XpAut\ASSAP
   ```
2. Copy the example file to `.env.local`:
   ```powershell
   Copy-Item .env.example .env.local
   ```
3. Open `.env.local` in your code editor and fill in your keys:
   ```bash
   # Application URL
   NEXT_PUBLIC_APP_NAME=ASAP
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Supabase Keys (Public and Server)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Paystack Keys (Test mode)
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
   PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
   PAYSTACK_WEBHOOK_SECRET=your-paystack-secret-key
   SUBSCRIPTION_MONTHLY_AMOUNT_NGN=1000
   FREE_TRIAL_DAYS=30

   # Optional AI and Job Keys
   OPENROUTER_API_KEY=your-openrouter-key
   OPENROUTER_FREE_MODEL=meta-llama/llama-3.3-70b-instruct:free
   CRON_SECRET=your-random-cron-secret
   ```
4. Save the file. Remember: if the dev server was already running, restart it to load the new keys.

---

## Step 3: Run database migrations and RLS policies

To set up the database tables, security rules, and automatic profile triggers:

1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase/migrations/20261123_000001_initial_schema.sql` from this repository, copy all text, paste it into the SQL Editor, and click **Run**. This creates:
   * `public.users` (with roles: `customer`, `provider`, `admin`)
   * `public.provider_profiles`
   * `public.identity_records`
   * `public.reviews`
   * `public.subscriptions`
4. Open `supabase/migrations/20261123_000002_rls_and_storage.sql`, paste it into the SQL Editor, and click **Run**. This creates:
   * Row Level Security (RLS) policies
   * Private Supabase Storage bucket `id-documents` for selfies and ID uploads
5. Open `supabase/migrations/20261123_000003_auth_trigger_and_rls.sql`, paste it into the SQL Editor, and click **Run**. This creates:
   * The `handle_new_user()` trigger on `auth.users` to automatically synchronize new sign-ups into `public.users` with their designated role
   * Safe profile insertion policies for authenticated users
6. *(Optional)* If you want sample Nigerian artisans preloaded for testing, paste and run `supabase/seed.sql`.

---

## Step 4: Configure Google OAuth in Google Cloud and Supabase

1. **Get your Supabase Callback URL:**
   * Your callback URL is formatted as:
     `https://<your-project-ref>.supabase.co/auth/v1/callback`
   * (You can find your Project Reference under Project Settings -> General in Supabase).
2. **Set up Google Cloud Console:**
   * Go to [console.cloud.google.com](https://console.cloud.google.com).
   * Create a new project named **ASAP**.
   * Navigate to **APIs & Services** -> **OAuth consent screen**.
     * Select **External** user type and click Create.
     * Fill in App name: **ASAP**, User support email, and Developer contact information. Click Save and Continue through scopes.
   * Navigate to **APIs & Services** -> **Credentials**.
     * Click **Create Credentials** -> **OAuth client ID**.
     * Application type: Select **Web application**.
     * Name: **ASAP Web Client**.
     * Under **Authorized redirect URIs**, click **Add URI** and paste your Supabase callback URL:
       `https://<your-project-ref>.supabase.co/auth/v1/callback`
     * Click **Create**.
     * Copy the generated **Client ID** and **Client Secret**.
3. **Enable Google Provider in Supabase:**
   * In the Supabase Dashboard, go to **Authentication** -> **Providers**.
   * Click on **Google** to expand it.
   * Toggle **Enable Sign in with Google** to ON.
   * Paste your **Client ID** and **Client Secret**.
   * Click **Save**.

---

## Step 5: Configure Site URL, Redirect URLs, and Email Auth

1. **Set Site URL & Redirect URLs in Supabase:**
   * Go to **Authentication** -> **URL Configuration**.
   * Set **Site URL** to:
     `http://localhost:3000`
   * Under **Redirect URLs**, add the following URLs:
     * `http://localhost:3000/**`
     * `http://localhost:3000/auth/callback`
   * Click **Save**.
2. **Verify Email Auth Settings:**
   * Go to **Authentication** -> **Providers** -> **Email**.
   * Ensure **Enable Email provider** is turned ON.
   * Under **Confirm email**, ensure it is toggled according to your preference (for frictionless OTP login, the built-in `signInWithOtp` sends a 6-digit verification code directly to the user's inbox).

---

## Step 6: Test Google sign-in and provider email registration

1. **Install dependencies and verify the code:**
   ```powershell
   npm install
   npm test
   npm run typecheck
   ```
2. **Start the development server:**
   ```powershell
   npm run dev
   ```
3. **Test Customer / User Google Sign-In:**
   * Open `http://localhost:3000/auth/login` in your browser.
   * Click **Continue with Google**.
   * Select your Google account. Google will redirect back to `/auth/callback`, which establishes your secure session and navigates to `/explore`.
   * Look at the top navigation bar to see your email, and visit `http://localhost:3000/profile` to inspect your account details.
   * Click the **Sign out** button to verify that you are logged out immediately and redirected cleanly.
4. **Test Service Provider Email Registration & Verification:**
   * Go to `http://localhost:3000/auth/signup`.
   * Enter your business email address and click **Send 6-Digit Code**.
   * Check your inbox for the 6-digit OTP from Supabase.
   * Enter the code and click **Verify & Continue**.
   * Proceed through the zero-cost verification flow:
     * Snap a camera selfie.
     * Upload an ID document (NIN, voter card, driver license, or passport).
     * Enter your trade, state, and WhatsApp phone number.
   * Complete registration. The application activates your **30-Day Free Trial** in `subscriptions` and directs you to the Provider Hub (`/provider/dashboard`).
5. **Verify Zero Grace Period & Paystack:**
   * In `/provider/dashboard`, check your active trial badge and expiration countdown.
   * Click **Renew Subscription (₦1,000/mo)** to test the Paystack popup checkout.
