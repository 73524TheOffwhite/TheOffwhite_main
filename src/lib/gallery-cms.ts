import { useQuery } from "@tanstack/react-query";

export type GalleryCategoryKey =
  | "all"
  | "level4"
  | "level5"
  | "food"
  | "events"
  | "tour360"
  | string;

export type GalleryCat = "All" | "Level 4" | "Level 5" | "Food" | "Events" | "360 View";

export type GalleryCmsItem = {
  id: string;
  src: string;
  cat: Exclude<GalleryCat, "All">;
  label: string;
};

export type GalleryCmsFilter = {
  key: GalleryCat;
  label: string;
};

export type GalleryCmsTourHotspot = {
  id: string;
  targetSceneId: string;
  linkName: string;
  yaw: number;
  pitch: number;
};

export type GalleryCmsTourScene = {
  id: string;
  name: string;
  label: string;
  panorama: string;
  thumbnail: string;
  hotspots: GalleryCmsTourHotspot[];
};

export type GalleryCms = {
  header: {
    eyebrow: string;
    headline: string;
  };
  toggle: {
    expandLabel: string;
    collapseLabel: string;
  };
  filters: GalleryCmsFilter[];
  items: GalleryCmsItem[];
  previewSets: Partial<Record<GalleryCat, string[]>>;
  tourScenes: GalleryCmsTourScene[];
  usesCmsPhotos: boolean;
};

type CmsMedia = { name?: string; path?: string; previewUrl?: string };

type GallerySections = {
  toggle?: { expandLabel?: string; collapseLabel?: string };
  categories?: Array<{ key: GalleryCategoryKey; label: string; hidden?: boolean }>;
  photos?: Array<{
    id: string;
    image?: CmsMedia;
    label: string;
    category: string;
    sortOrder: number;
    active?: boolean;
  }>;
  previewSets?: Record<string, string[]>;
  tour?: {
    scenes?: Array<{
      id: string;
      name: string;
      label: string;
      panorama?: CmsMedia;
      thumbnail?: CmsMedia;
      hotspots?: GalleryCmsTourHotspot[];
    }>;
  };
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const MEDIA_BUCKET = "media";

const CATEGORY_KEY_TO_CAT: Record<string, Exclude<GalleryCat, "All">> = {
  level4: "Level 4",
  level5: "Level 5",
  food: "Food",
  events: "Events",
  tour360: "360 View",
};

const CAT_TO_CATEGORY_KEY: Record<Exclude<GalleryCat, "All">, string> = {
  "Level 4": "level4",
  "Level 5": "level5",
  Food: "food",
  Events: "events",
  "360 View": "tour360",
};

const DEFAULT_FILTERS: GalleryCmsFilter[] = [
  { key: "All", label: "All" },
  { key: "Level 4", label: "Level 4" },
  { key: "Level 5", label: "Level 5" },
  { key: "Food", label: "Food" },
  { key: "Events", label: "Events" },
  // Hidden for now — restore when bringing back 360° view:
  // { key: "360 View", label: "360° view" },
];

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
  return mediaUrl(media?.path || media?.previewUrl || media?.name);
}

function mapCategoryKey(key: string): Exclude<GalleryCat, "All"> {
  return CATEGORY_KEY_TO_CAT[key] || "Level 4";
}

function mapFilters(categories: GallerySections["categories"]): GalleryCmsFilter[] {
  if (!categories?.length) return DEFAULT_FILTERS;
  // Hide 360° / tour360 until we bring the virtual tour back.
  const visible = categories.filter(
    (category) => !category.hidden && category.key !== "tour360",
  );
  const mapped = visible
    .map((category) => {
      if (category.key === "all") return { key: "All" as const, label: category.label || "All" };
      const cat = mapCategoryKey(category.key);
      return { key: cat, label: category.label || cat };
    })
    .filter((filter) => filter.key !== "360 View");
  return mapped.length ? mapped : DEFAULT_FILTERS;
}

function mapItems(photos: GallerySections["photos"]): GalleryCmsItem[] {
  if (!photos?.length) return [];
  return photos
    .filter((photo) => photo.active !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((photo) => {
      const src = resolveMedia(photo.image);
      if (!src) return null;
      return {
        id: photo.id,
        src,
        cat: mapCategoryKey(photo.category),
        label: photo.label,
      };
    })
    .filter((item): item is GalleryCmsItem => Boolean(item));
}

function mapPreviewSets(
  previewSets: GallerySections["previewSets"] | undefined,
): Partial<Record<GalleryCat, string[]>> {
  if (!previewSets) return {};
  const mapped: Partial<Record<GalleryCat, string[]>> = {};
  for (const [key, ids] of Object.entries(previewSets)) {
    if (key === "all") {
      mapped.All = ids;
      continue;
    }
    const cat = mapCategoryKey(key);
    mapped[cat] = ids;
  }
  return mapped;
}

function mapTourScenes(scenes: GallerySections["tour"]): GalleryCmsTourScene[] {
  if (!scenes?.scenes?.length) return [];
  return scenes.scenes
    .map((scene) => {
      const panorama = resolveMedia(scene.panorama);
      const thumbnail = resolveMedia(scene.thumbnail);
      if (!panorama || !thumbnail) return null;
      return {
        id: scene.id,
        name: scene.name,
        label: scene.label,
        panorama,
        thumbnail,
        hotspots: scene.hotspots ?? [],
      };
    })
    .filter((scene): scene is GalleryCmsTourScene => Boolean(scene));
}

async function fetchGalleryCms(): Promise<GalleryCms | null> {
  const rows = await supabaseFetch<
    Array<{
      hero_eyebrow: string | null;
      hero_title: string | null;
      sections: GallerySections | null;
    }>
  >("page_content?select=hero_eyebrow,hero_title,sections&slug=eq.gallery&limit=1");

  const row = rows?.[0];
  if (!row) return null;

  const sections = row.sections ?? {};
  const items = mapItems(sections.photos);
  const tourScenes = mapTourScenes(sections.tour);

  return {
    header: {
      eyebrow: row.hero_eyebrow || "Gallery",
      headline: row.hero_title || "Moments, captured.",
    },
    toggle: {
      expandLabel: sections.toggle?.expandLabel || "View Full Gallery",
      collapseLabel: sections.toggle?.collapseLabel || "Show Less",
    },
    filters: mapFilters(sections.categories),
    items,
    previewSets: mapPreviewSets(sections.previewSets),
    tourScenes,
    usesCmsPhotos: items.length > 0,
  };
}

export function useGalleryCms() {
  return useQuery({
    queryKey: ["page_content", "gallery"],
    queryFn: fetchGalleryCms,
    staleTime: 60 * 1000,
  });
}

export function categoryKeyForCat(cat: GalleryCat): string | null {
  if (cat === "All") return "all";
  return CAT_TO_CATEGORY_KEY[cat] ?? null;
}

export { DEFAULT_FILTERS };
