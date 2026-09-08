import { useQuery } from "@tanstack/react-query";

export type CmsMedia = { name?: string; path?: string; previewUrl?: string };
export type CmsLink = { label: string; href: string };

export type SpaceCms = {
  hero: {
    eyebrow: string;
    headline: string;
    body: string;
    button: CmsLink;
    collage: Array<{ id: string; alt: string; imageUrl?: string }>;
  };
  memories: {
    eyebrow: string;
    slides: Array<
      | { id: string; type: "image"; alt: string; imageUrl?: string }
      | { id: string; type: "quote" }
    >;
    quotes: Array<{ id: string; text: string; author: string }>;
  };
  experiences: {
    eyebrow: string;
    levels: Array<{
      id: string;
      levelLabel: string;
      title: string;
      description: string;
      imageUrl?: string;
      imageAlt: string;
      button: CmsLink;
      decorImageUrl?: string;
    }>;
  };
  philosophy: {
    headline: string;
    body: string;
    highlight: string;
    wordmark: string;
    pillars: Array<{
      id: string;
      label: string;
      icon: "leaf" | "heart" | "sun" | "users" | "custom";
      customIconUrl?: string;
    }>;
  };
};

type SpaceSections = {
  heroExtras?: {
    button?: CmsLink;
    collage?: Array<{ id: string; alt: string; image?: CmsMedia }>;
  };
  memories?: {
    eyebrow?: string;
    slides?: Array<
      | { id: string; type: "image"; alt: string; image?: CmsMedia }
      | { id: string; type: "quote" }
    >;
    quotes?: Array<{ id: string; text: string; author: string }>;
  };
  experiences?: {
    eyebrow?: string;
    levels?: Array<{
      id: string;
      levelLabel: string;
      title: string;
      description: string;
      image?: CmsMedia;
      imageAlt: string;
      button: CmsLink;
      decorImage?: CmsMedia;
    }>;
  };
  philosophy?: {
    headline?: string;
    body?: string;
    highlight?: string;
    wordmark?: string;
    pillars?: Array<{
      id: string;
      label: string;
      icon: "leaf" | "heart" | "sun" | "users" | "custom";
      customIcon?: CmsMedia;
    }>;
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

async function fetchSpaceCms(): Promise<SpaceCms | null> {
  const rows = await supabaseFetch<
    Array<{
      hero_eyebrow: string | null;
      hero_title: string | null;
      hero_description: string | null;
      hero_image_path: string | null;
      sections: SpaceSections | null;
    }>
  >(
    "page_content?select=hero_eyebrow,hero_title,hero_description,hero_image_path,sections&slug=eq.the-space&limit=1",
  );

  const row = rows?.[0];
  if (!row) return null;
  const sections = row.sections ?? {};

  const collage = (sections.heroExtras?.collage || []).map((slot) => ({
    id: slot.id,
    alt: slot.alt,
    imageUrl:
      slot.id === "tall" && row.hero_image_path
        ? mediaUrl(row.hero_image_path)
        : resolveMedia(slot.image),
  }));

  return {
    hero: {
      eyebrow: row.hero_eyebrow || "",
      headline: row.hero_title || "",
      body: row.hero_description || "",
      button: sections.heroExtras?.button || { label: "Explore The Space", href: "#gallery" },
      collage,
    },
    memories: {
      eyebrow: sections.memories?.eyebrow || "Memories Made Here",
      slides: (sections.memories?.slides || []).map((slide) =>
        slide.type === "quote"
          ? { id: slide.id, type: "quote" as const }
          : {
              id: slide.id,
              type: "image" as const,
              alt: slide.alt,
              imageUrl: resolveMedia(slide.image),
            },
      ),
      quotes: sections.memories?.quotes || [],
    },
    experiences: {
      eyebrow: sections.experiences?.eyebrow || "Choose Your Experience",
      levels: (sections.experiences?.levels || []).map((level) => ({
        id: level.id,
        levelLabel: level.levelLabel,
        title: level.title,
        description: level.description,
        imageUrl: resolveMedia(level.image),
        imageAlt: level.imageAlt,
        button: level.button,
        decorImageUrl: resolveMedia(level.decorImage),
      })),
    },
    philosophy: {
      headline: sections.philosophy?.headline || "Our Philosophy",
      body: sections.philosophy?.body || "",
      highlight: sections.philosophy?.highlight || "",
      wordmark: sections.philosophy?.wordmark || "forever.",
      pillars: (sections.philosophy?.pillars || []).map((pillar) => ({
        id: pillar.id,
        label: pillar.label,
        icon: pillar.icon,
        customIconUrl: resolveMedia(pillar.customIcon),
      })),
    },
  };
}

export function useSpaceCms() {
  return useQuery({
    queryKey: ["page_content", "the-space"],
    queryFn: fetchSpaceCms,
    staleTime: 60 * 1000,
  });
}
