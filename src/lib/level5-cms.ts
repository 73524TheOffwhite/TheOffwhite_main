import { useQuery } from "@tanstack/react-query";

export type Level5Cms = {
  hero: {
    imageUrl?: string;
    eyebrow: string;
    headline: string;
    subline: string;
  };
  features: Array<{
    id: string;
    icon: "guests" | "arch" | "sun" | "custom";
    title: string;
    body: string;
    customIconUrl?: string;
  }>;
  story: {
    eyebrow: string;
    title: string;
    intro: string;
    paragraphs: string[];
    pills: Array<{ id: string; label: string }>;
    closing: string;
  };
  occasions: {
    headline: string;
    cards: Array<{ id: string; label: string; alt: string; imageUrl?: string }>;
  };
  note: {
    portraitUrl?: string;
    portraitAlt: string;
    headline: string;
    body: string;
    signOff: string;
    signature1: string;
    signature2: string;
  };
  walk: {
    headline: string;
    thumbs: Array<{ id: string; label: string; imageUrl?: string }>;
  };
  goldenHour: {
    backgroundUrl?: string;
    headline: string;
    cardTitle: string;
    nameLabel: string;
    eventNameLabel: string;
    button: { label: string; href: string };
    footerScript: string;
  };
};

type CmsMedia = { name?: string; path?: string; previewUrl?: string };

type Level5Sections = {
  features?: Array<{
    id: string;
    icon: "guests" | "arch" | "sun" | "custom";
    title: string;
    body: string;
    customIcon?: CmsMedia;
  }>;
  story?: Level5Cms["story"];
  occasions?: {
    headline?: string;
    cards?: Array<{ id: string; label: string; alt: string; image?: CmsMedia }>;
  };
  note?: {
    portrait?: CmsMedia;
    portraitAlt?: string;
    headline?: string;
    body?: string;
    signOff?: string;
    signature1?: string;
    signature2?: string;
  };
  walk?: {
    headline?: string;
    thumbs?: Array<{ id: string; label: string; image?: CmsMedia }>;
  };
  goldenHour?: {
    background?: CmsMedia;
    headline?: string;
    cardTitle?: string;
    nameLabel?: string;
    eventNameLabel?: string;
    button?: { label: string; href: string };
    footerScript?: string;
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

async function fetchLevel5Cms(): Promise<Level5Cms | null> {
  const rows = await supabaseFetch<
    Array<{
      hero_eyebrow: string | null;
      hero_title: string | null;
      hero_description: string | null;
      hero_image_path: string | null;
      sections: Level5Sections | null;
    }>
  >(
    "page_content?select=hero_eyebrow,hero_title,hero_description,hero_image_path,sections&slug=eq.level-5&limit=1",
  );

  const row = rows?.[0];
  if (!row) return null;
  const sections = row.sections ?? {};

  return {
    hero: {
      imageUrl: mediaUrl(row.hero_image_path),
      eyebrow: row.hero_eyebrow || "Level 5",
      headline: row.hero_title || "Made for / beautiful / together.",
      subline: row.hero_description || "Celebrations. Gatherings. Milestones.",
    },
    features: (sections.features || []).map((feature) => ({
      id: feature.id,
      icon: feature.icon,
      title: feature.title,
      body: feature.body,
      customIconUrl: resolveMedia(feature.customIcon),
    })),
    story: {
      eyebrow: sections.story?.eyebrow || "The Space · Level 5",
      title: sections.story?.title || "The Private Party & Events Floor",
      intro: sections.story?.intro || "",
      paragraphs: sections.story?.paragraphs || [],
      pills: sections.story?.pills || [],
      closing: sections.story?.closing || "",
    },
    occasions: {
      headline: sections.occasions?.headline || "For every kind of celebration",
      cards: (sections.occasions?.cards || []).map((card) => ({
        id: card.id,
        label: card.label,
        alt: card.alt,
        imageUrl: resolveMedia(card.image),
      })),
    },
    note: {
      portraitUrl: resolveMedia(sections.note?.portrait),
      portraitAlt: sections.note?.portraitAlt || "The Off White owners",
      headline: sections.note?.headline || "A note from us.",
      body: sections.note?.body || "",
      signOff: sections.note?.signOff || "With love,",
      signature1: sections.note?.signature1 || "",
      signature2: sections.note?.signature2 || "",
    },
    walk: {
      headline: sections.walk?.headline || "Take a walk with us",
      thumbs: (sections.walk?.thumbs || []).map((thumb) => ({
        id: thumb.id,
        label: thumb.label,
        imageUrl: resolveMedia(thumb.image),
      })),
    },
    goldenHour: {
      backgroundUrl: resolveMedia(sections.goldenHour?.background),
      headline: sections.goldenHour?.headline || "Golden hour / belongs to / your moments.",
      cardTitle: sections.goldenHour?.cardTitle || "Plan Your Celebration",
      nameLabel: sections.goldenHour?.nameLabel || "Name",
      eventNameLabel: sections.goldenHour?.eventNameLabel || "Event Name",
      button: sections.goldenHour?.button || { label: "Enquire Now", href: "/contact#reserve" },
      footerScript: sections.goldenHour?.footerScript || "We can't wait to host you!",
    },
  };
}

export function useLevel5Cms() {
  return useQuery({
    queryKey: ["page_content", "level-5"],
    queryFn: fetchLevel5Cms,
    staleTime: 60 * 1000,
  });
}
