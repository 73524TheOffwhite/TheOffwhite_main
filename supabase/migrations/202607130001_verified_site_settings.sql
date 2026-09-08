-- Verified from the Google Maps listing shared on 13 July 2026.
-- Images and CMS content are intentionally not stored or seeded here.

BEGIN;

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
  ('latitude', '15.2619293', 'Google Maps latitude'),
  ('longitude', '73.9632973', 'Google Maps longitude'),
  ('plus_code', '7X67+Q8 Madgaon, Goa', 'Google Maps plus code'),
  ('google_maps_url', 'https://maps.app.goo.gl/jvHLryG1k2ZpDUfQ6', 'Google Maps listing'),
  ('google_maps_embed_url', 'https://maps.google.com/maps?q=15.2619293,73.9632973&z=17&ie=UTF8&output=embed', 'Google Maps embed URL'),
  ('osm_embed_url', '', 'OpenStreetMap embed URL'),
  ('contact_hours_text', '12:00 PM – 11:00 PM (All Days)', 'Contact page hours'),
  ('footer_hours_weekday', '12:00 PM – 11:00 PM', 'Monday through Thursday hours'),
  ('footer_hours_weekend', '12:00 PM – 11:00 PM', 'Friday through Sunday hours'),
  ('reservation_confirmation_message', 'Thank you! Your reservation request has been received. We will confirm shortly.', 'Reservation confirmation'),
  ('enquiry_confirmation_message', 'Thank you! Your enquiry has been received. Our events team will respond within 24 hours.', 'Enquiry confirmation')
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

DELETE FROM public.opening_hours WHERE location = 'all';

INSERT INTO public.opening_hours
  (day_of_week, open_time, close_time, is_closed, location, sort_order)
VALUES
  (0, '12:00', '23:00', FALSE, 'all', 0),
  (1, '12:00', '23:00', FALSE, 'all', 1),
  (2, '12:00', '23:00', FALSE, 'all', 2),
  (3, '12:00', '23:00', FALSE, 'all', 3),
  (4, '12:00', '23:00', FALSE, 'all', 4),
  (5, '12:00', '23:00', FALSE, 'all', 5),
  (6, '12:00', '23:00', FALSE, 'all', 6);

COMMIT;
