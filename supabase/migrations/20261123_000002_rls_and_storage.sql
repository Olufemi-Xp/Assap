-- Migration: 20261123_000002_rls_and_storage.sql
-- Description: Row-Level Security (RLS) policies and private storage buckets

-- Enable RLS across all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- 1. Users Policies
CREATE POLICY "Users can view their own record"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile info"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. Identity Records Policies (Private, only owner can insert/select; never public)
CREATE POLICY "Users can view their own identity record"
  ON identity_records FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own identity record"
  ON identity_records FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Provider Profiles Policies
CREATE POLICY "Public and users can view active provider listings"
  ON provider_profiles FOR SELECT
  TO public
  USING (deleted_at IS NULL);

CREATE POLICY "Providers can update their own profile"
  ON provider_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can create their profile"
  ON provider_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 4. Subscriptions Policies
CREATE POLICY "Providers can view their own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM provider_profiles 
    WHERE provider_profiles.id = subscriptions.provider_id 
      AND provider_profiles.user_id = auth.uid()
  ));

-- 5. Payment Events Policies
CREATE POLICY "Providers can view their own payment events"
  ON payment_events FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM provider_profiles 
    WHERE provider_profiles.id = payment_events.provider_id 
      AND provider_profiles.user_id = auth.uid()
  ));

-- 6. Ratings Policies
CREATE POLICY "Anyone can view ratings"
  ON ratings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Customers can insert their own rating"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = customer_id AND
    NOT EXISTS (
      SELECT 1 FROM provider_profiles 
      WHERE provider_profiles.id = ratings.provider_id 
        AND provider_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Customers can update their own rating"
  ON ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- 7. Reports Policies
CREATE POLICY "Users can insert reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id AND reporter_id <> reported_user_id);

CREATE POLICY "Reporters can view their own submitted reports"
  ON reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- 8. User Blocks Policies
CREATE POLICY "Users can view their own block list"
  ON user_blocks FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id);

CREATE POLICY "Users can insert blocks"
  ON user_blocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id AND blocker_id <> blocked_user_id);

CREATE POLICY "Users can delete their own blocks"
  ON user_blocks FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_id);

-- Private Storage Buckets Configuration (for live selfies and valid ID documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('identity-selfies', 'identity-selfies', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('identity-documents', 'identity-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Private Buckets
CREATE POLICY "Users can upload their own selfie"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'identity-selfies' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own selfie"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'identity-selfies' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload their own ID document"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'identity-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own ID document"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'identity-documents' AND (storage.foldername(name))[1] = auth.uid()::text);
