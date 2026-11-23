-- Supabase Seed Data for ASAP MVP (Local & Staging Development)

-- 1. Insert Users across Roles
INSERT INTO users (id, email, full_name, role, email_verified_at, state, location_area)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@asap.ng', 'ASAP Platform Admin', 'admin', now(), 'lagos', 'Ikeja'),
  ('c0000000-0000-0000-0000-000000000001', 'chidi.customer@gmail.com', 'Chidi Okonkwo', 'customer', now(), 'lagos', 'Surulere'),
  ('c0000000-0000-0000-0000-000000000002', 'amina.customer@gmail.com', 'Amina Bello', 'customer', now(), 'kano', 'Nassarawa'),
  ('p0000000-0000-0000-0000-000000000001', 'tunde.plumber@gmail.com', 'Babatunde Adeleke', 'provider', now(), 'lagos', 'Yaba'),
  ('p0000000-0000-0000-0000-000000000002', 'emeka.electrician@gmail.com', 'Emeka Nnamdi', 'provider', now(), 'rivers', 'Port Harcourt'),
  ('p0000000-0000-0000-0000-000000000003', 'fatima.cleaner@gmail.com', 'Fatima Danjuma', 'provider', now(), 'abuja', 'Maitama')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Identity Records
INSERT INTO identity_records (id, user_id, id_document_type, selfie_storage_path, id_document_storage_path, capture_status)
VALUES
  ('i0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'nin', 'p0000000-0000-0000-0000-000000000001/selfie.jpg', 'p0000000-0000-0000-0000-000000000001/id.jpg', 'submitted'),
  ('i0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000002', 'voters_card', 'p0000000-0000-0000-0000-000000000002/selfie.jpg', 'p0000000-0000-0000-0000-000000000002/id.jpg', 'submitted'),
  ('i0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000003', 'drivers_license', 'p0000000-0000-0000-0000-000000000003/selfie.jpg', 'p0000000-0000-0000-0000-000000000003/id.jpg', 'submitted')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Provider Profiles
INSERT INTO provider_profiles (id, user_id, business_name, service_category, service_description, state, location_area, phone_number, whatsapp_number, average_rating, rating_count)
VALUES
  ('pr000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'Tunde Reliable Plumbing', 'plumber', 'Expert leak detection, pipe fixing, water heater setup, and drain cleaning.', 'lagos', 'Yaba', '+2348012345678', '+2348012345678', 4.85, 12),
  ('pr000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000002', 'Emeka Spark Solutions', 'electrician', 'Residential wiring, prepaid meter troubleshooting, inverter setup, and emergency fixes.', 'rivers', 'Port Harcourt', '+2348098765432', '+2348098765432', 4.90, 8),
  ('pr000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000003', 'Fatima Pristine Cleaning', 'cleaner', 'Deep home cleaning, move-in/move-out cleaning, rug washing, and office maintenance.', 'fct', 'Maitama', '+2348055554444', '+2348055554444', 4.70, 5)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Subscriptions
-- Provider 1: Active 1-Month Free Trial (contacts visible)
INSERT INTO subscriptions (id, provider_id, plan_type, amount_ngn, status, current_period_start, current_period_end)
VALUES
  ('s0000000-0000-0000-0000-000000000001', 'pr000000-0000-0000-0000-000000000001', 'free_trial', 0, 'active', now() - INTERVAL '10 days', now() + INTERVAL '20 days')
ON CONFLICT (id) DO NOTHING;

-- Provider 2: Active Paid ₦1,000/Month Plan via Paystack (contacts visible)
INSERT INTO subscriptions (id, provider_id, plan_type, amount_ngn, status, current_period_start, current_period_end, paystack_reference)
VALUES
  ('s0000000-0000-0000-0000-000000000002', 'pr000000-0000-0000-0000-000000000002', 'monthly_1000_ngn', 1000, 'active', now() - INTERVAL '5 days', now() + INTERVAL '25 days', 'PAY_TEST_REF_002')
ON CONFLICT (id) DO NOTHING;

-- Provider 3: Expired Trial (zero grace period -> contacts HIDDEN)
INSERT INTO subscriptions (id, provider_id, plan_type, amount_ngn, status, current_period_start, current_period_end)
VALUES
  ('s0000000-0000-0000-0000-000000000003', 'pr000000-0000-0000-0000-000000000003', 'free_trial', 0, 'expired', now() - INTERVAL '40 days', now() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Ratings
INSERT INTO ratings (id, provider_id, customer_id, stars, comment)
VALUES
  ('r0000000-0000-0000-0000-000000000001', 'pr000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 5, 'Arrived promptly in Yaba and fixed the underground pipe leak neatly!'),
  ('r0000000-0000-0000-0000-000000000002', 'pr000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 5, 'Very knowledgeable electrician, sorted our DB box quickly.')
ON CONFLICT (id) DO NOTHING;
