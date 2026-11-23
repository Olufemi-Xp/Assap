-- Migration: 20261123_000003_auth_trigger_and_rls.sql
-- Description: Automatic user profile creation trigger, Google OAuth & Email OTP user linking, and RLS policies

-- 1. Allow authenticated users to insert their own profile row in public.users
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can insert their own record'
  ) THEN
    CREATE POLICY "Users can insert their own record"
      ON public.users FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. Allow public to read basic user info (for reviews, provider listings)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Public can view active users'
  ) THEN
    CREATE POLICY "Public can view active users"
      ON public.users FOR SELECT
      TO public
      USING (deleted_at IS NULL AND is_suspended = false);
  END IF;
END $$;

-- 3. Automatic trigger to create a public.users row when a user signs up via auth.users (Google OAuth or Email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role text;
  user_name text;
BEGIN
  -- Extract role from user metadata, defaulting to 'customer' if not provided
  assigned_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  IF assigned_role NOT IN ('customer', 'provider', 'admin') THEN
    assigned_role := 'customer';
  END IF;

  -- Extract full name from Google OAuth (name / full_name) or email
  user_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    email_verified_at,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    user_name,
    assigned_role,
    CASE WHEN new.email_confirmed_at IS NOT NULL THEN new.email_confirmed_at ELSE now() END,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = coalesce(public.users.full_name, EXCLUDED.full_name),
    email_verified_at = coalesce(public.users.email_verified_at, EXCLUDED.email_verified_at),
    updated_at = now();

  RETURN new;
END;
$$;

-- Drop trigger if it already exists, then re-create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Enable service provider onboarding creation policy
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'provider_profiles' AND policyname = 'Providers can insert their profile'
  ) THEN
    CREATE POLICY "Providers can insert their profile"
      ON public.provider_profiles FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;
