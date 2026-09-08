-- Reliable public form submission for the original main-site schema.
-- Run AFTER your original schema script and migration 004.
-- Safe to re-run.

BEGIN;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ── RLS: allow direct INSERT (fallback path) ─────────────────
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

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

-- ── RPC: SECURITY DEFINER (works even when SELECT is blocked) ─
CREATE OR REPLACE FUNCTION public.website_submit_reservation(
  reservation_date DATE,
  reservation_time TEXT,
  guests INTEGER,
  location TEXT,
  name TEXT,
  phone TEXT,
  source TEXT,
  occasion TEXT DEFAULT NULL,
  seating_preference TEXT DEFAULT NULL,
  email TEXT DEFAULT NULL,
  special_request TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_phone TEXT;
  ref_code TEXT;
BEGIN
  clean_phone := regexp_replace(COALESCE(phone, ''), '\D', '', 'g');

  IF trim(COALESCE(name, '')) = ''
     OR length(clean_phone) < 10
     OR reservation_date IS NULL
     OR reservation_date < CURRENT_DATE
     OR trim(COALESCE(reservation_time, '')) = ''
     OR guests IS NULL
     OR guests < 1
     OR guests > 12
     OR location NOT IN ('level4', 'level5')
     OR source NOT IN ('events_full', 'home_mini', 'admin_manual', 'whatsapp')
  THEN
    RAISE EXCEPTION 'Please provide valid reservation details.' USING ERRCODE = '22000';
  END IF;

  INSERT INTO public.reservations (
    reservation_date,
    reservation_time,
    guests,
    location,
    occasion,
    seating_preference,
    name,
    phone,
    email,
    special_request,
    source
  ) VALUES (
    reservation_date,
    reservation_time,
    guests,
    location::public.location_id,
    NULLIF(trim(occasion), ''),
    NULLIF(trim(seating_preference), ''),
    trim(name),
    clean_phone,
    NULLIF(trim(email), ''),
    NULLIF(trim(special_request), ''),
    source::public.reservation_source
  )
  RETURNING reference_code INTO ref_code;

  RETURN json_build_object(
    'reference_code', ref_code,
    'message', 'Your reservation request has been received.'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.website_submit_enquiry(
  type TEXT,
  source TEXT,
  name TEXT,
  email TEXT,
  occasion TEXT,
  event_date DATE,
  guests TEXT,
  phone TEXT DEFAULT NULL,
  event_time TEXT DEFAULT NULL,
  message TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  clean_email TEXT;
  clean_phone TEXT;
  ref_code TEXT;
BEGIN
  clean_email := lower(trim(COALESCE(email, '')));
  clean_phone := NULLIF(regexp_replace(COALESCE(phone, ''), '\D', '', 'g'), '');

  IF trim(COALESCE(name, '')) = ''
     OR clean_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
     OR trim(COALESCE(occasion, '')) = ''
     OR event_date IS NULL
     OR trim(COALESCE(guests, '')) = ''
     OR type NOT IN ('private_event', 'level5_booking', 'corporate', 'other')
     OR source NOT IN ('contact', 'level5', 'admin_manual')
  THEN
    RAISE EXCEPTION 'Please provide valid enquiry details.' USING ERRCODE = '22000';
  END IF;

  INSERT INTO public.enquiries (
    type,
    source,
    name,
    email,
    phone,
    occasion,
    event_date,
    event_time,
    guests,
    message
  ) VALUES (
    type::public.enquiry_type,
    source::public.enquiry_source,
    trim(name),
    clean_email,
    clean_phone,
    trim(occasion),
    event_date,
    NULLIF(trim(event_time), ''),
    trim(guests),
    NULLIF(trim(message), '')
  )
  RETURNING reference_code INTO ref_code;

  RETURN json_build_object(
    'reference_code', ref_code,
    'message', 'Your enquiry has been received.'
  );
END;
$$;

REVOKE ALL ON FUNCTION public.website_submit_reservation(
  DATE, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;

REVOKE ALL ON FUNCTION public.website_submit_enquiry(
  TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.website_submit_reservation(
  DATE, TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT
) TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.website_submit_enquiry(
  TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT, TEXT, TEXT
) TO anon, authenticated;

UPDATE public.testimonials
SET status = 'published'
WHERE is_active = TRUE
  AND show_on_home = TRUE
  AND status IS DISTINCT FROM 'published';

COMMIT;
