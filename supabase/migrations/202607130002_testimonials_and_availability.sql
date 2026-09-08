-- Testimonials + reservation availability (time slots, blackout dates)
-- Safe to re-run: uses IF NOT EXISTS and ON CONFLICT.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.testimonials (
  id TEXT PRIMARY KEY,
  quote TEXT NOT NULL,
  author TEXT NOT NULL,
  meta TEXT,
  posted_when TEXT,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  source TEXT NOT NULL DEFAULT 'google',
  show_on_home BOOLEAN NOT NULL DEFAULT TRUE,
  show_on_about BOOLEAN NOT NULL DEFAULT FALSE,
  show_on_space BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upgrade existing testimonials table if it was created with an older schema.
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS meta TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS posted_when TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS show_on_about BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS show_on_space BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS testimonials_slug_unique ON public.testimonials (slug);

CREATE TABLE IF NOT EXISTS public.reservation_settings (
  id SERIAL PRIMARY KEY,
  location TEXT NOT NULL DEFAULT 'all' CHECK (location IN ('all', 'level4', 'level5')),
  time_slot TEXT NOT NULL,
  max_guests_per_slot INTEGER NOT NULL DEFAULT 12,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (location, time_slot)
);

ALTER TABLE public.reservation_settings ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT 'all';
ALTER TABLE public.reservation_settings ADD COLUMN IF NOT EXISTS time_slot TEXT;
ALTER TABLE public.reservation_settings ADD COLUMN IF NOT EXISTS max_guests_per_slot INTEGER NOT NULL DEFAULT 12;
ALTER TABLE public.reservation_settings ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.reservation_settings ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX IF NOT EXISTS reservation_settings_location_time_slot_unique
  ON public.reservation_settings (location, time_slot);

CREATE TABLE IF NOT EXISTS public.blackout_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blackout_date DATE NOT NULL,
  location TEXT NOT NULL DEFAULT 'all' CHECK (location IN ('all', 'level4', 'level5')),
  reason TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (blackout_date, location)
);

ALTER TABLE public.blackout_dates ADD COLUMN IF NOT EXISTS blackout_date DATE;
ALTER TABLE public.blackout_dates ADD COLUMN IF NOT EXISTS location TEXT NOT NULL DEFAULT 'all';
ALTER TABLE public.blackout_dates ADD COLUMN IF NOT EXISTS reason TEXT;
ALTER TABLE public.blackout_dates ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.blackout_dates ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS blackout_dates_date_location_unique
  ON public.blackout_dates (blackout_date, location);

INSERT INTO public.site_settings (key, value, description)
VALUES (
  'google_reviews_url',
  'https://www.google.com/maps/place/The+Off+White+Bar+%26+Grill/@15.2619293,73.9632973,17z/data=!4m17!1m8!3m7!1s0x3bbfb3eee483565d:0xad6e50cdef9d0546!2sThe+Off+White+Bar+%26+Grill!8m2!3d15.2619293!4d73.9632973!10e1!16s%2Fg%2F11k9j8r_46!3m7!1s0x3bbfb3eee483565d:0xad6e50cdef9d0546!8m2!3d15.2619293!4d73.9632973!9m1!1b1!16s%2Fg%2F11k9j8r_46',
  'Google Maps reviews listing'
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO public.testimonials
  (id, slug, quote, author, meta, posted_when, rating, source, show_on_home, sort_order, is_active)
VALUES
  (
    gen_random_uuid(),
    'google-karthik',
    'This place is just really awesome. Great ambience, extremely friendly staff, the food is simply too good. Definitely try the chef special nalupu rice — that dish is so unique and tastes really good. Overall a fantastic restaurant to spend the evening and enjoy your meal. Also I have to say they had very clean restrooms. Thank you.',
    'Karthik',
    'Local Guide · 375 reviews',
    'a month ago',
    5,
    'google',
    TRUE,
    1,
    TRUE
  ),
  (
    gen_random_uuid(),
    'google-anup-patil',
    'Today we had the most amazing lunch at The Off White, Goa! The decor is stylish and inviting, creating a truly special atmosphere. We tried the starters and main course, and everything was absolutely delicious — tender, perfectly seasoned, and full of flavor. The cocktails were top-notch, and the staff were warm, professional, and made our visit memorable. If you''re in Goa, this place is a must-visit for incredible food and an unbeatable setting. Will definitely be back!',
    'Anup Patil',
    'Local Guide · 5 reviews',
    '6 months ago',
    5,
    'google',
    TRUE,
    2,
    TRUE
  ),
  (
    gen_random_uuid(),
    'google-shreyas-devarajan',
    'Absolutely brilliant. This place is so good, I was quite literally inhaling the food. The drinks are exquisite; the coconut toffee for a mocktail is an excellent choice. Sanjay served us during lunch and had excellent recommendations. I am in awe — for South Goa it''s a top choice.',
    'Shreyas Devarajan',
    'Local Guide · 36 reviews',
    '7 months ago',
    5,
    'google',
    TRUE,
    3,
    TRUE
  ),
  (
    gen_random_uuid(),
    'google-samyuktha-roy',
    'Superior service, ambrosia-like food, and a soothing ambience — that''s how I''d put my experience at The Off White Bar & Grill. Went there based on an acquaintance''s recommendation, and boy, am I glad I did! The Mutton Nelapu Pulao is one of the best items I''ve tasted not only in Goa, but also in comparison to the curated meals in big cities like Bengaluru. It is flavourful, perfectly cooked and a sublime experience. The servers are extremely professional, polite, and accommodating, and the ambience is calm with a pleasant view. I very rarely rate any restaurant with 5 stars, but this one was without a second thought.',
    'Samyuktha Roy',
    'Local Guide · 18 reviews',
    '8 months ago',
    5,
    'google',
    TRUE,
    4,
    TRUE
  ),
  (
    gen_random_uuid(),
    'google-surjeet-sharma',
    'Food is top notch and the ambience is very nice. Service is super fast and efficient, and the location is convenient as it''s close to the railway station. Absolutely delicious — the flavors were perfectly balanced and everything tasted incredibly fresh! The servers anticipated our needs, bringing water refills and extra napkins without even being asked, and treated us like valued guests. Really loved the music. Thank you, The Off White team — you are incredible.',
    'Surjeet Sharma',
    '2 reviews',
    'a month ago',
    5,
    'google',
    TRUE,
    5,
    TRUE
  )
ON CONFLICT (slug) DO UPDATE
SET quote = EXCLUDED.quote,
    author = EXCLUDED.author,
    meta = EXCLUDED.meta,
    posted_when = EXCLUDED.posted_when,
    rating = EXCLUDED.rating,
    source = EXCLUDED.source,
    show_on_home = EXCLUDED.show_on_home,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

INSERT INTO public.reservation_settings (location, time_slot, max_guests_per_slot, is_active, sort_order)
VALUES
  ('all', '12:00 PM', 12, TRUE, 1),
  ('all', '12:30 PM', 12, TRUE, 2),
  ('all', '1:00 PM', 12, TRUE, 3),
  ('all', '1:30 PM', 12, TRUE, 4),
  ('all', '7:00 PM', 12, TRUE, 5),
  ('all', '7:30 PM', 12, TRUE, 6),
  ('all', '8:00 PM', 12, TRUE, 7),
  ('all', '8:30 PM', 12, TRUE, 8),
  ('all', '9:00 PM', 12, TRUE, 9),
  ('all', '9:30 PM', 12, TRUE, 10),
  ('all', '10:00 PM', 12, TRUE, 11),
  ('all', '10:30 PM', 12, TRUE, 12),
  ('all', '11:00 PM', 12, TRUE, 13)
ON CONFLICT (location, time_slot) DO UPDATE
SET max_guests_per_slot = EXCLUDED.max_guests_per_slot,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order;

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blackout_dates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read active testimonials" ON public.testimonials;
CREATE POLICY "Public read active testimonials"
  ON public.testimonials FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public read active reservation settings" ON public.reservation_settings;
CREATE POLICY "Public read active reservation settings"
  ON public.reservation_settings FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Public read active blackout dates" ON public.blackout_dates;
CREATE POLICY "Public read active blackout dates"
  ON public.blackout_dates FOR SELECT
  TO anon, authenticated
  USING (is_active = TRUE);

GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT SELECT ON public.reservation_settings TO anon, authenticated;
GRANT SELECT ON public.blackout_dates TO anon, authenticated;

COMMIT;
