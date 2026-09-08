-- Fix form saves for the ORIGINAL main-site schema.
--
-- Your first script enabled RLS but did NOT allow anon INSERT on
-- reservations / enquiries (Edge Functions + service_role only).
-- This migration opens INSERT for the public website forms.
--
-- Run AFTER your original schema script. Safe to re-run.

BEGIN;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Drop any insert-blocking state on these two tables only.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('reservations', 'enquiries')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

CREATE POLICY "website_insert_reservations"
  ON public.reservations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "website_insert_enquiries"
  ON public.enquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

GRANT INSERT ON public.reservations TO anon, authenticated;
GRANT INSERT ON public.enquiries TO anon, authenticated;

-- Original schema uses generate_reference_code('RES'/'ENQ') defaults — keep those.
-- Do not replace with a different trigger here.

-- Testimonials from migration 002 need status = 'published' to pass original RLS.
UPDATE public.testimonials
SET status = 'published'
WHERE is_active = TRUE
  AND show_on_home = TRUE
  AND status IS DISTINCT FROM 'published';

COMMIT;
