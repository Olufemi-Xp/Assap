-- Migration: 20261123_000001_initial_schema.sql
-- Description: Core 8 tables, constraints, foreign keys, and query indexes for ASAP MVP

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'provider', 'admin')),
  email_verified_at TIMESTAMPTZ NULL,
  state VARCHAR(32) NULL,
  location_area VARCHAR(120) NULL,
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Identity Records Table (Private live selfie + valid ID card paths)
CREATE TABLE IF NOT EXISTS identity_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  id_document_type VARCHAR(32) NOT NULL CHECK (id_document_type IN ('nin', 'voters_card', 'drivers_license', 'international_passport')),
  selfie_storage_path TEXT NOT NULL,
  id_document_storage_path TEXT NOT NULL,
  capture_status VARCHAR(32) NOT NULL DEFAULT 'submitted' CHECK (capture_status IN ('submitted', 'flagged', 'reviewed')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Provider Profiles Table
CREATE TABLE IF NOT EXISTS provider_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  business_name VARCHAR(140) NOT NULL,
  service_category VARCHAR(40) NOT NULL CHECK (service_category IN ('plumber', 'electrician', 'cleaner', 'carpenter', 'laundry', 'mechanic', 'painter', 'ac_technician', 'other')),
  service_description TEXT NOT NULL DEFAULT '',
  state VARCHAR(32) NOT NULL,
  location_area VARCHAR(120) NOT NULL,
  phone_number VARCHAR(32) NOT NULL,
  whatsapp_number VARCHAR(32) NOT NULL,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (average_rating >= 0.00 AND average_rating <= 5.00),
  rating_count INTEGER NOT NULL DEFAULT 0 CHECK (rating_count >= 0),
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Subscriptions Table (1-month free trial + ₦1,000/month Paystack plans, zero grace period)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  plan_type VARCHAR(32) NOT NULL DEFAULT 'free_trial' CHECK (plan_type IN ('free_trial', 'monthly_1000_ngn')),
  amount_ngn INTEGER NOT NULL DEFAULT 0 CHECK (amount_ngn >= 0),
  status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('pending_payment', 'active', 'expired', 'cancelled')),
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL CHECK (current_period_end > current_period_start),
  paystack_reference VARCHAR(128) NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Payment Events Table (Idempotent Paystack event logging)
CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NULL REFERENCES subscriptions(id) ON DELETE SET NULL ON UPDATE CASCADE,
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  paystack_reference VARCHAR(128) NOT NULL UNIQUE,
  amount_ngn INTEGER NOT NULL DEFAULT 1000 CHECK (amount_ngn > 0),
  currency VARCHAR(8) NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
  status VARCHAR(32) NOT NULL DEFAULT 'initialized' CHECK (status IN ('initialized', 'succeeded', 'failed', 'ignored_duplicate')),
  processed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Ratings Table (1 to 5 stars, unique per customer & provider)
CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  stars SMALLINT NOT NULL CHECK (stars BETWEEN 1 AND 5),
  comment VARCHAR(500) NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_ratings_provider_customer UNIQUE (provider_id, customer_id)
);

-- 7. Reports Table (Safety & trust reports)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
  reason VARCHAR(40) NOT NULL CHECK (reason IN ('fraud_or_scam', 'fake_profile_or_id', 'harassment_or_abuse', 'misleading_service', 'other')),
  details TEXT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'dismissed')),
  resolved_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_report_not_self CHECK (reporter_id <> reported_user_id)
);

-- 8. User Blocks Table (Directed user-to-user blocking)
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_blocks_pair UNIQUE (blocker_id, blocked_user_id),
  CONSTRAINT chk_block_not_self CHECK (blocker_id <> blocked_user_id)
);

-- Performance & Query-Driven Indexes
CREATE INDEX IF NOT EXISTS idx_provider_profiles_state_category_rating 
  ON provider_profiles (state, service_category, average_rating DESC, rating_count DESC);

CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_id 
  ON provider_profiles (user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_status_end 
  ON subscriptions (provider_id, status, current_period_end DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_expiry_scan 
  ON subscriptions (status, current_period_end);

CREATE INDEX IF NOT EXISTS idx_payment_events_reference 
  ON payment_events (paystack_reference);

CREATE INDEX IF NOT EXISTS idx_ratings_provider_id 
  ON ratings (provider_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reports_status_created 
  ON reports (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker_blocked 
  ON user_blocks (blocker_id, blocked_user_id);
