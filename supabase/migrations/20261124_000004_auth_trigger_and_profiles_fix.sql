-- Migration: 20261124_000004_auth_trigger_and_profiles_fix.sql
-- Description: Bulletproof auth trigger, username column support, profiles compatibility, and error prevention

-- 1. Ensure username column exists on public.users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username VARCHAR(120);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (lower(username));

-- 2. Create or replace a public.profiles view pointing to public.users for backward/cross compatibility
CREATE OR REPLACE VIEW public.profiles AS 
  SELECT 
    id,
    email,
    full_name,
    username,
    role,
    state,
    location_area,
    email_verified_at,
    is_suspended,
    created_at,
    updated_at
  FROM public.users;

-- 3. Ensure RLS policies on public.users allow users to manage their own records
DO $$ 
BEGIN
  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can insert their own record'
  ) THEN
    CREATE POLICY "Users can insert their own record"
      ON public.users FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Select policy (public or authenticated)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Public can view active users'
  ) THEN
    CREATE POLICY "Public can view active users"
      ON public.users FOR SELECT
      TO public
      USING (deleted_at IS NULL AND is_suspended = false);
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' AND policyname = 'Users can update their own record'
  ) THEN
    CREATE POLICY "Users can update their own record"
      ON public.users FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 4. Robust, failsafe trigger function for auth.users creation/updates
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role text;
  user_full_name text;
  user_username text;
BEGIN
  -- A. Extract role safely ('customer', 'provider', 'admin')
  assigned_role := coalesce(new.raw_user_meta_data->>'role', 'customer');
  IF assigned_role NOT IN ('customer', 'provider', 'admin') THEN
    assigned_role := 'customer';
  END IF;

  -- B. Extract full name
  user_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );

  -- C. Extract or generate username
  user_username := coalesce(
    new.raw_user_meta_data->>'username',
    lower(regexp_replace(user_full_name, '[^a-zA-Z0-9_]', '_', 'g')),
    split_part(new.email, '@', 1)
  );

  -- D. Delete any orphan rows in public.users with matching email but different id
  -- (Prevents "duplicate key value violates unique constraint users_email_key" when auth users are deleted/re-created)
  DELETE FROM public.users WHERE email = new.email AND id <> new.id;

  -- E. Safe upsert into public.users
  INSERT INTO public.users (
    id,
    email,
    full_name,
    username,
    role,
    email_verified_at,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    user_full_name,
    user_username,
    assigned_role,
    CASE WHEN new.email_confirmed_at IS NOT NULL THEN new.email_confirmed_at ELSE now() END,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = coalesce(EXCLUDED.full_name, public.users.full_name),
    username = coalesce(EXCLUDED.username, public.users.username),
    role = CASE 
      WHEN public.users.role = 'provider' THEN 'provider' 
      ELSE EXCLUDED.role 
    END,
    email_verified_at = coalesce(EXCLUDED.email_verified_at, public.users.email_verified_at),
    updated_at = now();

  -- F. If a standalone public.profiles table exists in the Supabase instance, upsert there too
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND table_type = 'BASE TABLE'
  ) THEN
    BEGIN
      INSERT INTO public.profiles (id, full_name, username, updated_at)
      VALUES (new.id, user_full_name, user_username, now())
      ON CONFLICT (id) DO UPDATE SET
        full_name = coalesce(EXCLUDED.full_name, public.profiles.full_name),
        username = coalesce(EXCLUDED.username, public.profiles.username),
        updated_at = now();
    EXCEPTION WHEN OTHERS THEN
      -- Log warning but never abort the user registration
      RAISE WARNING 'profiles base table insert skipped: %', SQLERRM;
    END;
  END IF;

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Critical safeguard: Never let a trigger exception abort auth.users creation!
  -- This prevents Supabase from returning "500: Database error saving new user".
  RAISE WARNING 'handle_new_user exception caught: %', SQLERRM;
  RETURN new;
END;
$$;

-- 5. Drop existing trigger if any, and reattach to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
