import { useQuery } from "@tanstack/react-query";

export type CmsLink = { label: string; href: string };
export type CmsMedia = { name?: string; path?: string; previewUrl?: string };

export type HomepageCms = {
  hero: {
    imageUrl?: string;
    eyebrow: string;
    headline: string;
    button1: CmsLink;
    button2: CmsLink;
    scrollLabel: string;
    scrollHref: string;
  };
  story: {
    imageUrl?: string;
    eyebrow: string;
    headline: string;
    body: string;
    button: CmsLink;
  };
  dishes: {
    eyebrow: string;
    headline: string;
    button: CmsLink;
    cards: Array<{ id: string; name: string; notes: string; imageUrl?: string }>;
  };
  space: {
    eyebrow: string;
    headline: string;
    button: CmsLink;
    cards: Array<{ id: string; label: string; imageUrl?: string }>;
  };
  menuPreview: {
    eyebrow: string;
    headline: string;
    button: CmsLink;
    columns: Array<{ id: string; title: string; items: string[] }>;
    reservation: { eyebrow: string; headline: string; submitLabel: string };
  };
  testimonialsSection: {
    eyebrow: string;
    ratingLine: string;
    buttonLabel: string;
    decorImageUrl?: string;
  };
};

type HomeSections = {
  heroExtras?: {
    button1?: CmsLink;
    button2?: CmsLink;
    scrollLabel?: string;
    scrollHref?: string;
  };
  story?: {
    image?: CmsMedia;
    eyebrow?: string;
    headline?: string;
    body?: string;
    button?: CmsLink;
  };
  space?: {
    eyebrow?: string;
    headline?: string;
    button?: CmsLink;
    cards?: Array<{ id: string; label: string; image?: CmsMedia }>;
  };
  menuPreview?: HomepageCms["menuPreview"];
  dishes?: {
    eyebrow?: string;
    headline?: string;
    button?: CmsLink;
    cards?: Array<{ id: string; name: string; notes: string; image?: CmsMedia }>;
  };
  testimonialsSection?: {
    eyebrow?: string;
    ratingLine?: string;
    buttonLabel?: string;
    decorImage?: CmsMedia;
  };
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

export function mediaUrl(pathOrUrl?: string | null, _width = 1400, _quality = 75) {
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

function resolveMedia(media?: CmsMedia | null, width?: number) {
  return mediaUrl(media?.path || media?.previewUrl, width);
}

async function fetchHomepageCms(): Promise<HomepageCms | null> {
  const rows = await supabaseFetch<
    Array<{
      hero_eyebrow: string | null;
      hero_title: string | null;
      hero_image_path: string | null;
      sections: HomeSections | null;
    }>
  >("page_content?select=hero_eyebrow,hero_title,hero_image_path,sections&slug=eq.home&limit=1");

  const row = rows?.[0];
  if (!row) return null;

  const sections = row.sections ?? {};

  return {
    hero: {
      imageUrl: mediaUrl(row.hero_image_path, 1920, 72),
      eyebrow: row.hero_eyebrow || "",
      headline: row.hero_title || "",
      button1: sections.heroExtras?.button1 || { label: "Reserve a Table", href: "/events" },
      button2: sections.heroExtras?.button2 || { label: "View Menu", href: "#menu" },
      scrollLabel: sections.heroExtras?.scrollLabel || "Scroll Down",
      scrollHref: sections.heroExtras?.scrollHref || "#story",
    },
    story: {
      imageUrl: resolveMedia(sections.story?.image, 1100),
      eyebrow: sections.story?.eyebrow || "Our Story",
      headline: sections.story?.headline || "",
      body: sections.story?.body || "",
      button: sections.story?.button || { label: "Discover Our Story", href: "/about" },
    },
    dishes: {
      eyebrow: sections.dishes?.eyebrow || "Signature Dishes",
      headline: sections.dishes?.headline || "Art on a Plate",
      button: sections.dishes?.button || { label: "Explore Full Menu", href: "/menu" },
      cards: (sections.dishes?.cards || []).map((card) => ({
        id: card.id,
        name: card.name,
        notes: card.notes,
        imageUrl: resolveMedia(card.image, 800),
      })),
    },
    space: {
      eyebrow: sections.space?.eyebrow || "The Space",
      headline: sections.space?.headline || "Every Corner Has a Story",
      button: sections.space?.button || { label: "View Gallery", href: "/gallery" },
      cards: (sections.space?.cards || []).map((card) => ({
        id: card.id,
        label: card.label,
        imageUrl: resolveMedia(card.image, 900),
      })),
    },
    menuPreview: sections.menuPreview || {
      eyebrow: "Menu Preview",
      headline: "A Taste of What Awaits",
      button: { label: "Explore Full Menu", href: "/menu" },
      columns: [],
      reservation: {
        eyebrow: "Reservation",
        headline: "Book Your Table",
        submitLabel: "Reserve Your Table",
      },
    },
    testimonialsSection: {
      eyebrow: sections.testimonialsSection?.eyebrow || "What Our Guests Say",
      ratingLine: sections.testimonialsSection?.ratingLine || "Rated 5.0 by our guests on Google",
      buttonLabel: sections.testimonialsSection?.buttonLabel || "Read More Reviews on Google",
      decorImageUrl: resolveMedia(sections.testimonialsSection?.decorImage, 900),
    },
  };
}

export function useHomepageCms() {
  return useQuery({
    queryKey: ["page_content", "home"],
    queryFn: fetchHomepageCms,
    staleTime: 60 * 1000,
  });
}
