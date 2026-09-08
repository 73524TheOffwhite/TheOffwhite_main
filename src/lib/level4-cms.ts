import { useQuery } from "@tanstack/react-query";

export type Level4Cms = {
  hero: {
    eyebrow: string;
    headline: string;
    body: string;
    buttonLabel: string;
  };
  collage: Array<{ id: string; alt: string; imageUrl?: string }>;
  mood: {
    quoteLines: string[];
    button: { label: string; href: string };
  };
  story: {
    eyebrow: string;
    title: string;
    intro: string;
    paragraphs: string[];
    features: Array<{ id: string; label: string }>;
  };
};

type CmsMedia = { name?: string; path?: string; previewUrl?: string };

type Level4Sections = {
  heroExtras?: {
    buttonLabel?: string;
    collage?: Array<{ id: string; label?: string; alt: string; image?: CmsMedia }>;
  };
  mood?: {
    quoteLines?: string[];
    button?: { label: string; href: string };
  };
  story?: {
    eyebrow?: string;
    title?: string;
    intro?: string;
    paragraphs?: string[];
    features?: Array<{ id: string; label: string }>;
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

async function fetchLevel4Cms(): Promise<Level4Cms | null> {
  const rows = await supabaseFetch<
    Array<{
      hero_eyebrow: string | null;
      hero_title: string | null;
      hero_description: string | null;
      hero_image_path: string | null;
      sections: Level4Sections | null;
    }>
  >(
    "page_content?select=hero_eyebrow,hero_title,hero_description,hero_image_path,sections&slug=eq.level-4&limit=1",
  );

  const row = rows?.[0];
  if (!row) return null;
  const sections = row.sections ?? {};

  return {
    hero: {
      eyebrow: row.hero_eyebrow || "Level 4",
      headline: row.hero_title || "For conversations that deserve time.",
      body:
        row.hero_description ||
        "The kind of evening you'll remember next year. Not because of what you ate. Because of who you shared it with.",
      buttonLabel: sections.heroExtras?.buttonLabel || "Explore Level 4",
    },
    collage: (sections.heroExtras?.collage || []).map((slot) => ({
      id: slot.id,
      alt: slot.alt,
      imageUrl:
        slot.id === "dining" && row.hero_image_path
          ? mediaUrl(row.hero_image_path)
          : resolveMedia(slot.image),
    })),
    mood: {
      quoteLines: sections.mood?.quoteLines?.length
        ? sections.mood.quoteLines
        : ["The light changes.", "The mood changes.", "The evening unfolds."],
      button: sections.mood?.button || { label: "Discover More", href: "/contact#reserve" },
    },
    story: {
      eyebrow: sections.story?.eyebrow || "The Space · Level 4",
      title: sections.story?.title || "The Signature Fine Dining & Bar Experience",
      intro: sections.story?.intro || "",
      paragraphs: sections.story?.paragraphs || [],
      features: sections.story?.features || [],
    },
  };
}

export function useLevel4Cms() {
  return useQuery({
    queryKey: ["page_content", "level-4"],
    queryFn: fetchLevel4Cms,
    staleTime: 60 * 1000,
  });
}
