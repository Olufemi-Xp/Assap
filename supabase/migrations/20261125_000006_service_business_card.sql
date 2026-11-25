-- Migration: 20261125_000006_service_business_card.sql
-- Description: Add Service Business Card fields (service_title and structured service_areas)
--              to public.provider_profiles.
-- Safe to re-run: idempotent.

ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS service_title VARCHAR(140) NULL;

ALTER TABLE public.provider_profiles
  ADD COLUMN IF NOT EXISTS service_areas JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_provider_profiles_service_title
  ON public.provider_profiles (lower(service_title));
