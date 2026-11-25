-- Migration: 20261125_000005_locations_portfolio_reviews.sql
-- Description: Hierarchical location (State -> City -> LGA), provider portfolio
--              (delivered job history) with likes/comments/shares, and storage.
-- Safe to re-run: every statement is idempotent.

-- 1. Hierarchical location columns
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS city VARCHAR(120) NULL;
ALTER TABLE public.provider_profiles ADD COLUMN IF NOT EXISTS lga VARCHAR(120) NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS city VARCHAR(120) NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS lga VARCHAR(120) NULL;

CREATE INDEX IF NOT EXISTS idx_provider_profiles_state_city_lga
  ON public.provider_profiles (state, city, lga);

-- 2. Portfolio items (delivered job history)
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.provider_profiles(id) ON DELETE CASCADE ON UPDATE CASCADE,
  title VARCHAR(140) NOT NULL,
  delivery_story TEXT NOT NULL,
  before_image_url TEXT NULL,
  after_image_url TEXT NULL,
  job_location VARCHAR(140) NULL,
  completed_on DATE NULL,
  duration VARCHAR(60) NULL,
  extra_details VARCHAR(1000) NULL,
  share_count INTEGER NOT NULL DEFAULT 0 CHECK (share_count >= 0),
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_provider_created
  ON public.portfolio_items (provider_id, created_at DESC);

-- 3. Likes (one per user per item)
CREATE TABLE IF NOT EXISTS public.portfolio_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.portfolio_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_portfolio_likes_item_user UNIQUE (item_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_likes_item ON public.portfolio_likes (item_id);

-- 4. Comments
CREATE TABLE IF NOT EXISTS public.portfolio_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.portfolio_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body VARCHAR(500) NOT NULL CHECK (char_length(trim(body)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_comments_item_created
  ON public.portfolio_comments (item_id, created_at DESC);

-- 5. Row-Level Security
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_comments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'portfolio_items' AND policyname = 'Anyone can view portfolio items') THEN
    CREATE POLICY "Anyone can view portfolio items"
      ON public.portfolio_items FOR SELECT TO public
      USING (deleted_at IS NULL);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'portfolio_items' AND policyname = 'Providers manage their own portfolio') THEN
    CREATE POLICY "Providers manage their own portfolio"
      ON public.portfolio_items FOR ALL TO authenticated
      USING (EXISTS (
        SELECT 1 FROM public.provider_profiles pp
        WHERE pp.id = portfolio_items.provider_id AND pp.user_id = auth.uid()
      ))
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.provider_profiles pp
        WHERE pp.id = portfolio_items.provider_id AND pp.user_id = auth.uid()
      ));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'portfolio_likes' AND policyname = 'Anyone can view portfolio likes') THEN
    CREATE POLICY "Anyone can view portfolio likes"
      ON public.portfolio_likes FOR SELECT TO public USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'portfolio_likes' AND policyname = 'Users like as themselves') THEN
    CREATE POLICY "Users like as themselves"
      ON public.portfolio_likes FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'portfolio_likes' AND policyname = 'Users remove their own likes') THEN
    CREATE POLICY "Users remove their own likes"
      ON public.portfolio_likes FOR DELETE TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'portfolio_comments' AND policyname = 'Anyone can view portfolio comments') THEN
    CREATE POLICY "Anyone can view portfolio comments"
      ON public.portfolio_comments FOR SELECT TO public USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'portfolio_comments' AND policyname = 'Users comment as themselves') THEN
    CREATE POLICY "Users comment as themselves"
      ON public.portfolio_comments FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'portfolio_comments' AND policyname = 'Users delete their own comments') THEN
    CREATE POLICY "Users delete their own comments"
      ON public.portfolio_comments FOR DELETE TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 6. Public storage bucket for before/after portfolio photos (5 MB, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('portfolio-images', 'portfolio-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Providers upload own portfolio images') THEN
    CREATE POLICY "Providers upload own portfolio images"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'portfolio-images' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Providers delete own portfolio images') THEN
    CREATE POLICY "Providers delete own portfolio images"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'portfolio-images' AND (storage.foldername(name))[1] = auth.uid()::text);
  END IF;
END $$;
