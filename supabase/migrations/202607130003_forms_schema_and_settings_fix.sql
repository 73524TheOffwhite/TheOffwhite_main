-- Forms schema, public insert policies, and verified site settings fix.
-- Run in Supabase SQL Editor if forms are not saving.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.opening_hours (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TEXT NOT NULL,
  close_time TEXT NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  location TEXT NOT NULL DEFAULT 'all',
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT UNIQUE,
  reservation_date DATE NOT NULL,
  reservation_time TEXT NOT NULL,
  guests INTEGER NOT NULL CHECK (guests BETWEEN 1 AND 12),
  location TEXT NOT NULL CHECK (location IN ('level4', 'level5')),
  occasion TEXT,
  seating_preference TEXT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  special_request TEXT,
  source TEXT NOT NULL CHECK (source IN ('events_full', 'home_mini', 'admin_manual')),
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_code TEXT UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('private_event', 'level5_booking', 'general')),
  source TEXT NOT NULL CHECK (source IN ('contact', 'level5', 'admin')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  occasion TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT,
  guests TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submission_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  form_type TEXT NOT NULL CHECK (form_type IN ('reservation', 'enquiry')),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.set_reference_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference_code IS NULL OR NEW.reference_code = '' THEN
    NEW.reference_code :=
      'OW-' || to_char(NOW(), 'YYYYMMDD') || '-' ||
      lpad((floor(random() * 10000))::int::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS reservations_reference_code ON public.reservations;
CREATE TRIGGER reservations_reference_code
  BEFORE INSERT ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.set_reference_code();

DROP TRIGGER IF EXISTS enquiries_reference_code ON public.enquiries;
CREATE TRIGGER enquiries_reference_code
  BEFORE INSERT ON public.enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_reference_code();

CREATE OR REPLACE VIEW public.v_public_settings AS
SELECT key, value
FROM public.site_settings;

INSERT INTO public.site_settings (key, value, description)
VALUES
  ('brand_name', 'The Off White Bar & Grill', 'Brand name'),
  ('tagline', 'Fine Dining · Crafted Cocktails · Mediterranean Soul', 'Footer tagline'),
  ('copyright_year', '2026', 'Copyright year'),
  ('phone_primary', '+918767811778', 'Primary phone'),
  ('phone_display', '+91 87678 11778', 'Display phone'),
  ('whatsapp_number', '918767811778', 'WhatsApp digits only'),
  ('whatsapp_message_template', 'Hi, I''d like to reserve a table at The Off White.', 'Default WhatsApp message'),
  ('email_primary', 'hello@theoffwhite.in', 'Primary email'),
  ('email_events', 'hello@theoffwhite.in', 'Events notification email'),
  ('address_line1', 'Sitara Atrium, 4th Floor, Sitara Building', 'Address line 1'),
  ('address_line2', 'Colmorod, Navelim Highway, Sanscar Society', 'Address line 2'),
  ('city', 'Madgaon, Navelim', 'City and locality'),
  ('state', 'Goa', 'State'),
  ('pincode', '403601', 'Pincode'),
  ('country', 'India', 'Country'),
  ('google_maps_url', 'https://maps.app.goo.gl/jvHLryG1k2ZpDUfQ6', 'Google Maps listing'),
  ('google_maps_embed_url', 'https://maps.google.com/maps?q=15.2619293,73.9632973&z=17&ie=UTF8&output=embed', 'Google Maps embed URL'),
  ('contact_hours_text', '12:00 PM – 11:00 PM (All Days)', 'Contact page hours'),
  ('footer_hours_weekday', '12:00 PM – 11:00 PM', 'Monday through Thursday hours'),
  ('footer_hours_weekend', '12:00 PM – 11:00 PM', 'Friday through Sunday hours'),
  ('reservation_confirmation_message', 'Thank you! Your reservation request has been received. We will confirm shortly.', 'Reservation confirmation'),
  ('enquiry_confirmation_message', 'Thank you! Your enquiry has been received. Our events team will respond within 24 hours.', 'Enquiry confirmation'),
  ('google_reviews_url', 'https://www.google.com/maps/place/The+Off+White+Bar+%26+Grill/@15.2619293,73.9632973,17z/data=!4m17!1m8!3m7!1s0x3bbfb3eee483565d:0xad6e50cdef9d0546!2sThe+Off+White+Bar+%26+Grill!8m2!3d15.2619293!4d73.9632973!10e1!16s%2Fg%2F11k9j8r_46!3m7!1s0x3bbfb3eee483565d:0xad6e50cdef9d0546!8m2!3d15.2619293!4d73.9632973!9m1!1b1!16s%2Fg%2F11k9j8r_46', 'Google Maps reviews listing')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opening_hours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read site settings" ON public.site_settings;
CREATE POLICY "Public read site settings"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public insert reservations" ON public.reservations;
CREATE POLICY "Public insert reservations"
  ON public.reservations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert enquiries" ON public.enquiries;
CREATE POLICY "Public insert enquiries"
  ON public.enquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public read opening hours" ON public.opening_hours;
CREATE POLICY "Public read opening hours"
  ON public.opening_hours FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT SELECT ON public.v_public_settings TO anon, authenticated;
GRANT SELECT ON public.opening_hours TO anon, authenticated;
GRANT INSERT ON public.reservations TO anon, authenticated;
GRANT INSERT ON public.enquiries TO anon, authenticated;

COMMIT;
