import { googleReviewsUrl as fallbackReviewsUrl } from "@/data/testimonials";

export type GoogleReviewItem = {
  id: string;
  authorName: string;
  authorPhotoUrl?: string;
  authorUrl?: string;
  rating: number;
  text: string;
  relativeTime: string;
  reviewUrl?: string;
};

export type GoogleReviewsData = {
  rating: number;
  userRatingCount: number;
  reviews: GoogleReviewItem[];
  mapsUri: string;
};

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const PLACE_ID = import.meta.env.VITE_GOOGLE_PLACE_ID as string | undefined;
const PLACE_QUERY =
  (import.meta.env.VITE_GOOGLE_PLACE_QUERY as string | undefined) ||
  "The Off White Bar & Grill Navelim Goa";

/** Atmosphere review subfields — requesting bare `reviews` often returns an empty list. */
const PLACE_FIELD_MASK = [
  "rating",
  "userRatingCount",
  "googleMapsUri",
  "reviews.rating",
  "reviews.text",
  "reviews.relativePublishTimeDescription",
  "reviews.googleMapsUri",
  "reviews.authorAttribution",
].join(",");

type LocalizedText = string | { text?: string } | null | undefined;

type PlacesReview = {
  rating?: number;
  text?: LocalizedText;
  relativePublishTimeDescription?: string;
  googleMapsUri?: string;
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
    uri?: string;
  };
};

type PlaceDetailsResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
  error?: { message?: string; status?: string };
};

type GoogleMapsWindow = Window & {
  google?: {
    maps: {
      importLibrary: (name: string) => Promise<unknown>;
      places?: {
        PlacesServiceStatus: { OK: string };
        PlacesService: new (attrContainer: HTMLElement) => {
          getDetails: (
            request: { placeId: string; fields: string[] },
            callback: (
              result: LegacyPlaceResult | null,
              status: string,
            ) => void,
          ) => void;
        };
      };
    };
  };
};

type LegacyPlaceResult = {
  rating?: number;
  user_ratings_total?: number;
  url?: string;
  reviews?: Array<{
    author_name?: string;
    profile_photo_url?: string;
    author_url?: string;
    rating?: number;
    text?: string;
    relative_time_description?: string;
  }>;
};

function readLocalizedText(value: LocalizedText): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  return (value.text || "").trim();
}

function normalizeReviews(
  reviews: GoogleReviewItem[],
): GoogleReviewItem[] {
  return reviews.filter((review) => review.text.length > 0 || review.rating > 0);
}

function mapNewApiReviews(reviews: PlacesReview[] | undefined): GoogleReviewItem[] {
  return normalizeReviews(
    (reviews || []).map((review, index) => ({
      id: `gr-${index}`,
      authorName: review.authorAttribution?.displayName || "Google user",
      authorPhotoUrl: review.authorAttribution?.photoUri,
      authorUrl: review.authorAttribution?.uri,
      rating: review.rating || 0,
      text: readLocalizedText(review.text),
      relativeTime: review.relativePublishTimeDescription || "",
      reviewUrl: review.googleMapsUri,
    })),
  );
}

function mapLegacyReviews(reviews: LegacyPlaceResult["reviews"]): GoogleReviewItem[] {
  return normalizeReviews(
    (reviews || []).map((review, index) => ({
      id: `gr-legacy-${index}`,
      authorName: review.author_name || "Google user",
      authorPhotoUrl: review.profile_photo_url,
      authorUrl: review.author_url,
      rating: review.rating || 0,
      text: (review.text || "").trim(),
      relativeTime: review.relative_time_description || "",
      reviewUrl: review.author_url,
    })),
  );
}

export function isGoogleReviewsConfigured() {
  return Boolean(API_KEY?.trim());
}

export function ratingLabel(rating: number) {
  if (rating >= 4.5) return "EXCELLENT";
  if (rating >= 4) return "GOOD";
  if (rating >= 3) return "AVERAGE";
  return "FAIR";
}

async function resolvePlaceId(apiKey: string): Promise<string | null> {
  if (PLACE_ID?.trim()) return PLACE_ID.trim();

  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id",
    },
    body: JSON.stringify({
      textQuery: PLACE_QUERY,
      maxResultCount: 1,
    }),
  });

  const json = (await res.json()) as {
    places?: Array<{ id?: string }>;
    error?: { message?: string };
  };

  if (!res.ok) {
    throw new Error(json.error?.message || `Place search failed (${res.status})`);
  }

  const id = json.places?.[0]?.id;
  return id ? id.replace(/^places\//, "") : null;
}

async function fetchViaPlacesNew(
  apiKey: string,
  placeId: string,
): Promise<GoogleReviewsData | null> {
  const url = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`);
  url.searchParams.set("languageCode", "en");

  const res = await fetch(url.toString(), {
    headers: {
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACE_FIELD_MASK,
    },
  });

  const place = (await res.json()) as PlaceDetailsResponse;

  if (!res.ok) {
    const message = place.error?.message || `Google Places request failed (${res.status})`;
    console.error("[Google Reviews]", message);
    throw new Error(message);
  }

  const reviews = mapNewApiReviews(place.reviews);
  if (!reviews.length) return null;

  return {
    rating: place.rating || 0,
    userRatingCount: place.userRatingCount || reviews.length,
    reviews,
    mapsUri: place.googleMapsUri || fallbackReviewsUrl,
  };
}

function bootstrapGoogleMaps(apiKey: string) {
  const win = window as GoogleMapsWindow;
  if (win.google?.maps?.importLibrary) return;

  // Official Maps JavaScript API bootstrap pattern.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  const c = "google";
  const l = "importLibrary";
  const q = "__ib__";
  w[c] = w[c] || {};
  const d = w[c].maps || (w[c].maps = {});
  const r = new Set<string>();
  const e = new URLSearchParams({ key: apiKey, v: "weekly" });
  let h: Promise<void> | undefined;
  const u = () =>
    h ||
    (h = new Promise<void>((resolve, reject) => {
      const a = document.createElement("script");
      e.set("libraries", [...r].join(","));
      a.setAttribute("callback", `${c}.maps.${q}`);
      a.src = `https://maps.googleapis.com/maps/api/js?${e.toString()}`;
      d[q] = resolve;
      a.onerror = () => {
        h = undefined;
        reject(new Error("The Google Maps JavaScript API could not load."));
      };
      document.head.append(a);
    }));
  if (!d[l]) {
    d[l] = (f: string, ...n: unknown[]) => r.add(f) && u().then(() => d[l](f, ...n));
  }
}

/** Legacy Places Details often still returns the 5 public Google reviews. */
async function fetchViaLegacyPlacesService(
  apiKey: string,
  placeId: string,
): Promise<GoogleReviewsData | null> {
  bootstrapGoogleMaps(apiKey);
  const win = window as GoogleMapsWindow;
  await win.google!.maps.importLibrary("places");

  const places = win.google!.maps.places;
  if (!places) {
    throw new Error("Google Places library failed to load.");
  }

  const service = new places.PlacesService(document.createElement("div"));

  const result = await new Promise<LegacyPlaceResult>((resolve, reject) => {
    service.getDetails(
      {
        placeId,
        fields: ["rating", "user_ratings_total", "reviews", "url"],
      },
      (place, status) => {
        if (status !== places.PlacesServiceStatus.OK || !place) {
          reject(new Error(`Legacy Places Details failed: ${status}`));
          return;
        }
        resolve(place);
      },
    );
  });

  const reviews = mapLegacyReviews(result.reviews);
  if (!reviews.length) return null;

  return {
    rating: result.rating || 0,
    userRatingCount: result.user_ratings_total || reviews.length,
    reviews,
    mapsUri: result.url || fallbackReviewsUrl,
  };
}

export async function fetchGoogleReviews(): Promise<GoogleReviewsData | null> {
  if (!isGoogleReviewsConfigured() || !API_KEY) return null;

  const placeId = await resolvePlaceId(API_KEY);
  if (!placeId) {
    throw new Error("Google Place ID could not be resolved.");
  }

  try {
    const fromNew = await fetchViaPlacesNew(API_KEY, placeId);
    if (fromNew?.reviews.length) return fromNew;
  } catch (error) {
    console.warn("[Google Reviews] Places API (New) failed, trying legacy Places Details.", error);
  }

  try {
    const fromLegacy = await fetchViaLegacyPlacesService(API_KEY, placeId);
    if (fromLegacy?.reviews.length) return fromLegacy;
  } catch (error) {
    console.error("[Google Reviews] Legacy Places Details failed.", error);
    throw error;
  }

  console.warn("[Google Reviews] Place loaded but no reviews were returned.");
  return null;
}
