import { useQuery } from "@tanstack/react-query";

export type CmsMedia = { name?: string; path?: string; previewUrl?: string };
export type CmsLink = { label: string; href: string };

export type AboutCms = {
  hero: {
    imageUrl?: string;
    eyebrow: string;
    headline: string;
    description: string;
    breadcrumb: string;
  };
  philosophy: {
    eyebrow: string;
    headline: string;
    body1: string;
    body2: string;
    slides: Array<{ id: string; alt: string; imageUrl?: string }>;
  };
  founders: {
    eyebrow: string;
    headline: string;
    intro: string[];
    cards: Array<{
      id: string;
      name: string;
      role: string;
      paragraphs: string[];
      imageUrl?: string;
      image?: CmsMedia;
    }>;
    valuesEyebrow: string;
    valuesParagraphs: string[];
    closingLines: string[];
    socialHandles: string[];
  };
  values: {
    eyebrow: string;
    headline: string;
    cards: Array<{ id: string; title: string; body: string }>;
  };
  stats: Array<{ id: string; value: string; label: string }>;
  kitchen: {
    eyebrow: string;
    headline: string;
    body: string;
    attribution: string;
    button: CmsLink;
    slides: Array<{ id: string; alt: string; imageUrl?: string }>;
  };
};

type AboutSections = {
  heroExtras?: { breadcrumb?: string };
  philosophy?: AboutCms["philosophy"] & {
    slides?: Array<{ id: string; alt: string; image?: CmsMedia }>;
  };
  founders?: AboutCms["founders"];
  values?: AboutCms["values"];
  stats?: AboutCms["stats"];
  kitchen?: AboutCms["kitchen"] & {
    slides?: Array<{ id: string; alt: string; image?: CmsMedia }>;
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

export function mediaUrl(pathOrUrl?: string | null) {
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

async function fetchAboutCms(): Promise<AboutCms | null> {
  const rows = await supabaseFetch<
    Array<{
      hero_eyebrow: string | null;
      hero_title: string | null;
      hero_description: string | null;
      hero_image_path: string | null;
      sections: AboutSections | null;
    }>
  >(
    "page_content?select=hero_eyebrow,hero_title,hero_description,hero_image_path,sections&slug=eq.about&limit=1",
  );

  const row = rows?.[0];
  if (!row) return null;
  const sections = row.sections ?? {};

  return {
    hero: {
      imageUrl: mediaUrl(row.hero_image_path),
      eyebrow: row.hero_eyebrow || "",
      headline: row.hero_title || "",
      description: row.hero_description || "",
      breadcrumb: sections.heroExtras?.breadcrumb || "About",
    },
    philosophy: {
      eyebrow: sections.philosophy?.eyebrow || "",
      headline: sections.philosophy?.headline || "",
      body1: sections.philosophy?.body1 || "",
      body2: sections.philosophy?.body2 || "",
      slides: (sections.philosophy?.slides || []).map((slide) => ({
        id: slide.id,
        alt: slide.alt,
        imageUrl: resolveMedia(slide.image),
      })),
    },
    founders: sections.founders
      ? {
          ...sections.founders,
          cards: (sections.founders.cards || []).map((card) => ({
            ...card,
            imageUrl: card.imageUrl || resolveMedia(card.image),
          })),
        }
      : {
          eyebrow: "",
          headline: "",
          intro: [],
          cards: [],
          valuesEyebrow: "",
          valuesParagraphs: [],
          closingLines: [],
          socialHandles: [],
        },
    values: sections.values || { eyebrow: "", headline: "", cards: [] },
    stats: sections.stats || [],
    kitchen: {
      eyebrow: sections.kitchen?.eyebrow || "",
      headline: sections.kitchen?.headline || "",
      body: sections.kitchen?.body || "",
      attribution: sections.kitchen?.attribution || "",
      button: sections.kitchen?.button || { label: "See What's Cooking", href: "/menu" },
      slides: (sections.kitchen?.slides || []).map((slide) => ({
        id: slide.id,
        alt: slide.alt,
        imageUrl: resolveMedia(slide.image),
      })),
    },
  };
}

export function useAboutCms() {
  return useQuery({
    queryKey: ["page_content", "about"],
    queryFn: fetchAboutCms,
    staleTime: 60 * 1000,
  });
}
