import { useQuery } from "@tanstack/react-query";

export type ReservationsCms = {
  hero: {
    imageUrl?: string;
    eyebrow: string;
    headline: string;
    tagline: string;
    button1Label: string;
    button2Label: string;
    trustLine: string;
  };
  steps: {
    step1Label: string;
    step2Label: string;
  };
  step1: {
    title: string;
    continueLabel: string;
    unavailableMessage: string;
    locations: Array<{ id: string; label: string; sub: string }>;
    occasions: Array<{ id: string; label: string }>;
  };
  step2: {
    headline: string;
    body: string;
    summaryTitle: string;
    editButtonLabel: string;
    namePlaceholder: string;
    phonePlaceholder: string;
    specialRequestPlaceholder: string;
    submitLabel: string;
    loadingText: string;
    whatsappAltLabel: string;
    errorMessage: string;
  };
  success: {
    headline: string;
    bodyTemplate: string;
  };
};

type ReservationsSections = {
  heroExtras?: {
    button1Label?: string;
    button2Label?: string;
    trustLine?: string;
    image?: { path?: string; previewUrl?: string; name?: string };
  };
  steps?: ReservationsCms["steps"];
  step1?: ReservationsCms["step1"];
  step2?: ReservationsCms["step2"];
  success?: ReservationsCms["success"];
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

async function fetchReservationsCms(): Promise<ReservationsCms | null> {
  const rows = await supabaseFetch<
    Array<{
      hero_eyebrow: string | null;
      hero_title: string | null;
      hero_description: string | null;
      hero_image_path: string | null;
      sections: ReservationsSections | null;
    }>
  >(
    "page_content?select=hero_eyebrow,hero_title,hero_description,hero_image_path,sections&slug=eq.reservations&limit=1",
  );

  const row = rows?.[0];
  if (!row) return null;
  const sections = row.sections ?? {};
  const heroImage =
    mediaUrl(row.hero_image_path) ||
    mediaUrl(sections.heroExtras?.image?.path || sections.heroExtras?.image?.previewUrl);

  return {
    hero: {
      imageUrl: heroImage,
      eyebrow: row.hero_eyebrow || "Reservations",
      headline: row.hero_title || "Reserve A Table",
      tagline: row.hero_description || "Good food. Warm ambience. Memories to be made.",
      button1Label: sections.heroExtras?.button1Label || "Book Your Table",
      button2Label: sections.heroExtras?.button2Label || "WhatsApp Concierge",
      trustLine: sections.heroExtras?.trustLine || "Your details are safe with us",
    },
    steps: sections.steps || {
      step1Label: "Book Your Table",
      step2Label: "Confirm & Reserve",
    },
    step1: sections.step1 || {
      title: "Book Your Table",
      continueLabel: "Continue to Confirm",
      unavailableMessage: "Reservations are unavailable for the selected date.",
      locations: [
        { id: "level4", label: "LEVEL 4", sub: "Fine Dining & Bar" },
        { id: "level5", label: "LEVEL 5", sub: "Events & Parties" },
      ],
      occasions: [
        { id: "occ-1", label: "Birthday" },
        { id: "occ-2", label: "Anniversary" },
        { id: "occ-3", label: "Special Occasion" },
        { id: "occ-4", label: "Corporate" },
      ],
    },
    step2: sections.step2 || {
      headline: "Almost There!",
      body: "Please confirm your details and we'll take care of the rest.",
      summaryTitle: "Your Booking",
      editButtonLabel: "Edit Details",
      namePlaceholder: "Your Name",
      phonePlaceholder: "Your phone number",
      specialRequestPlaceholder:
        "Any dietary needs, seating preferences or celebrations we should know about?",
      submitLabel: "Confirm Reservation",
      loadingText: "Confirming…",
      whatsappAltLabel: "Reserve via WhatsApp {phone}",
      errorMessage: "Please check your details and try again.",
    },
    success: sections.success || {
      headline: "Reservation Received",
      bodyTemplate:
        "Thank you, {name}. We'll confirm your table for {date} at {time} shortly via +91 {phone}.",
    },
  };
}

export function useReservationsCms() {
  return useQuery({
    queryKey: ["page_content", "reservations"],
    queryFn: fetchReservationsCms,
    staleTime: 60 * 1000,
  });
}
