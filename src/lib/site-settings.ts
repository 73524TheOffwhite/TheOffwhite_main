import { useQuery } from "@tanstack/react-query";

export type SiteSettings = {
  brand_name: string;
  tagline: string;
  copyright_year: string;
  phone_primary: string;
  phone_display: string;
  whatsapp_number: string;
  whatsapp_message_template: string;
  email_primary: string;
  email_events: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  google_maps_url: string;
  google_maps_embed_url: string;
  contact_hours_text: string;
  footer_hours_weekday: string;
  footer_hours_weekend: string;
  reservation_confirmation_message: string;
  enquiry_confirmation_message: string;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brand_name: "The Off White Bar & Grill",
  tagline: "Fine Dining · Crafted Cocktails · Mediterranean Soul",
  copyright_year: "2026",
  phone_primary: "+918767811778",
  phone_display: "+91 87678 11778",
  whatsapp_number: "918767811778",
  whatsapp_message_template:
    "Hi! I’d like to reserve a table at Off White. Could you please help me with the reservation?",
  email_primary: "info@theoffwhite.com",
  email_events: "info@theoffwhite.com",
  address_line1: "Sitara Atrium, 4th Floor, Sitara Building",
  address_line2: "Colmorod, Navelim Highway, Sanscar Society",
  city: "Madgaon, Navelim",
  state: "Goa",
  pincode: "403601",
  country: "India",
  google_maps_url: "https://maps.app.goo.gl/jvHLryG1k2ZpDUfQ6",
  google_maps_embed_url:
    "https://maps.google.com/maps?q=15.2619293,73.9632973&z=17&ie=UTF8&output=embed",
  contact_hours_text: "12:00 PM – 11:00 PM (All Days)",
  footer_hours_weekday: "12:00 PM – 11:00 PM",
  footer_hours_weekend: "12:00 PM – 11:00 PM",
  reservation_confirmation_message:
    "Thank you! Your reservation request has been received. We will confirm shortly.",
  enquiry_confirmation_message:
    "Thank you! Your enquiry has been received. Our events team will respond within 24 hours.",
};

function mergeSettings(rows: Array<{ key: string; value: string }>): SiteSettings {
  const values = Object.fromEntries(
    rows
      .filter((row) => row.value?.trim())
      .map((row) => [row.key, row.value.trim()]),
  );

  return { ...DEFAULT_SITE_SETTINGS, ...values };
}

async function fetchSiteSettings(): Promise<SiteSettings> {
  const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return DEFAULT_SITE_SETTINGS;

  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
  };

  let response = await fetch(`${url}/rest/v1/v_public_settings?select=key,value`, { headers });

  if (!response.ok) {
    response = await fetch(`${url}/rest/v1/site_settings?select=key,value`, { headers });
  }

  if (!response.ok) return DEFAULT_SITE_SETTINGS;

  const rows = (await response.json()) as Array<{ key: string; value: string }>;
  return mergeSettings(rows);
}

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: fetchSiteSettings,
    initialData: DEFAULT_SITE_SETTINGS,
    staleTime: 5 * 60 * 1000,
  }).data;
}
