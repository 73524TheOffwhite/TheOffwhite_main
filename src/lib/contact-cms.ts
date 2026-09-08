import { useQuery } from "@tanstack/react-query";

export type ContactCms = {
  hero: {
    imageUrl?: string;
    headline: string;
    body: string;
  };
  infoLabels: {
    location: string;
    phone: string;
    email: string;
    hours: string;
  };
  map: {
    pinLabel: string;
    iframeTitle: string;
  };
  reservePanel: {
    imageUrl?: string;
    eyebrow: string;
    headline: string;
    body: string;
    button: { label: string; href: string };
  };
  enquiryPanel: {
    backgroundUrl?: string;
    leafDecorUrl?: string;
    eyebrow: string;
    headline: string;
    body: string;
  };
  form: {
    namePlaceholder: string;
    emailPlaceholder: string;
    occasionPlaceholder: string;
    datePlaceholder: string;
    guestsPlaceholder: string;
    messagePlaceholder: string;
    submitLabel: string;
    loadingText: string;
    errorMessage: string;
    successHeadline: string;
    successBodyTemplate: string;
  };
};

type CmsMedia = { name?: string; path?: string; previewUrl?: string };

type ContactSections = {
  infoLabels?: ContactCms["infoLabels"];
  map?: ContactCms["map"];
  reservePanel?: {
    image?: CmsMedia;
    eyebrow?: string;
    headline?: string;
    body?: string;
    button?: { label: string; href: string };
  };
  enquiryPanel?: {
    background?: CmsMedia;
    leafDecor?: CmsMedia;
    eyebrow?: string;
    headline?: string;
    body?: string;
  };
  form?: ContactCms["form"];
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const MEDIA_BUCKET = "media";

async function supabaseFetch<T>(path: string): Promise<T | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!response.ok) return null;
  return (await response.json()) as T;
}

function mediaUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return undefined;
  if (
    pathOrUrl.startsWith("http://") ||
    pathOrUrl.startsWith("https://") ||
    pathOrUrl.startsWith("blob:") ||
    pathOrUrl.startsWith("data:")
  ) {
    return pathOrUrl;
  }
  if (!SUPABASE_URL) return undefined;
  return `${SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/${pathOrUrl}`;
}

function resolveMedia(media?: CmsMedia | null) {
  return mediaUrl(media?.path || media?.previewUrl);
}

async function fetchContactCms(): Promise<ContactCms | null> {
  const rows = await supabaseFetch<
    Array<{
      hero_title: string | null;
      hero_description: string | null;
      hero_image_path: string | null;
      sections: ContactSections | null;
    }>
  >(
    "page_content?select=hero_title,hero_description,hero_image_path,sections&slug=eq.contact&limit=1",
  );

  const row = rows?.[0];
  if (!row) return null;
  const sections = row.sections ?? {};

  return {
    hero: {
      imageUrl: mediaUrl(row.hero_image_path),
      headline: row.hero_title || "Contact Us",
      body:
        row.hero_description ||
        "We'd love to hear from you. Reach out for reservations, events or any inquiries.",
    },
    infoLabels: sections.infoLabels || {
      location: "Location",
      phone: "Phone",
      email: "Email",
      hours: "Hours",
    },
    map: sections.map || {
      pinLabel: "The Off White",
      iframeTitle: "The Off White Bar & Grill on map — Navelim, Goa",
    },
    reservePanel: {
      imageUrl: resolveMedia(sections.reservePanel?.image),
      eyebrow: sections.reservePanel?.eyebrow || "Plan Your Evening",
      headline: sections.reservePanel?.headline || "Reserve a Table",
      body: sections.reservePanel?.body || "Great food, warm light and even better company.",
      button: sections.reservePanel?.button || { label: "Reserve a Table", href: "/events" },
    },
    enquiryPanel: {
      backgroundUrl: resolveMedia(sections.enquiryPanel?.background),
      leafDecorUrl: resolveMedia(sections.enquiryPanel?.leafDecor),
      eyebrow: sections.enquiryPanel?.eyebrow || "Private Enquiry",
      headline: sections.enquiryPanel?.headline || "Hosting something special?",
      body:
        sections.enquiryPanel?.body ||
        "Tell us about your occasion — date, guest count, and the mood you're after. Our team will respond within 24 hours with a proposal tailored to you.",
    },
    form: sections.form || {
      namePlaceholder: "Your Name",
      emailPlaceholder: "Email",
      occasionPlaceholder: "Occasion",
      datePlaceholder: "dd-mm-yyyy",
      guestsPlaceholder: "Approx. guests",
      messagePlaceholder: "Tell us a little about what you're planning...",
      submitLabel: "Send Enquiry",
      loadingText: "Sending…",
      errorMessage: "Please complete all required fields.",
      successHeadline: "Enquiry Received",
      successBodyTemplate: "Thank you, {name}. Our events team will respond within 24 hours.",
    },
  };
}

export function useContactCms() {
  return useQuery({
    queryKey: ["page_content", "contact"],
    queryFn: fetchContactCms,
    staleTime: 60 * 1000,
  });
}
