/** Elfsight Google Reviews widget ID (data source; template is not shown). */
export const ELFSIGHT_GOOGLE_REVIEWS_WIDGET_ID = "113d385f-3777-407f-9b18-c380633664f5";

/** Same Google Place ID configured in the Elfsight widget source. */
export const ELFSIGHT_GOOGLE_PLACE_ID = "ChIJXVaD5O6zvzsRRgWd781Qbq0";

const REVIEWS_ENDPOINT = "https://service-reviews-ultimate.elfsight.com/data/reviews";
/** First paint matches the original 5-card grid; more load via View more. */
export const TESTIMONIALS_INITIAL_VISIBLE = 5;
export const TESTIMONIALS_VIEW_MORE_STEP = 6;
const MAX_PAGES = 50;

export type ElfsightMappedReview = {
  id: string;
  quote: string;
  author: string;
  postedWhen: string;
  rating: number;
};

type ElfsightReview = {
  id?: string;
  reviewer_name?: string;
  rating?: number | string;
  text?: string | null;
  published_at?: number | string;
};

type ElfsightReviewsResponse = {
  status?: string;
  result?: { data?: ElfsightReview[] };
};

function formatRelativeTime(publishedAt: number | string | undefined): string {
  const seconds =
    typeof publishedAt === "number"
      ? publishedAt
      : typeof publishedAt === "string" && /^\d+$/.test(publishedAt)
        ? Number(publishedAt)
        : NaN;

  if (!Number.isFinite(seconds) || seconds <= 0) return "";

  const diffMs = Date.now() - seconds * 1000;
  if (diffMs < 0) return "recently";

  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

function mapReview(review: ElfsightReview, index: number): ElfsightMappedReview | null {
  const quote = (review.text || "").trim();
  // Elfsight widget is set to text-only — skip empty quotes so cards stay useful
  if (!quote) return null;

  const rating = Math.max(0, Math.min(5, Math.round(Number(review.rating) || 0)));

  return {
    id: review.id || `elfsight-${index}`,
    quote,
    author: (review.reviewer_name || "Guest").trim() || "Guest",
    postedWhen: formatRelativeTime(review.published_at),
    rating: rating || 5,
  };
}

async function fetchReviewsPage(page: number): Promise<ElfsightReview[]> {
  const url = new URL(REVIEWS_ENDPOINT);
  url.searchParams.append("uris[]", ELFSIGHT_GOOGLE_PLACE_ID);
  if (page > 1) url.searchParams.set("page", String(page));

  const res = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Elfsight reviews request failed (${res.status})`);
  }

  const json = (await res.json()) as ElfsightReviewsResponse;
  return json.result?.data || [];
}

/**
 * All Google reviews from Elfsight's data API, in Elfsight order.
 * Paginate until a page returns nothing new.
 */
export async function fetchElfsightGoogleReviews(): Promise<ElfsightMappedReview[]> {
  const seen = new Set<string>();
  const mapped: ElfsightMappedReview[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const rows = await fetchReviewsPage(page);
    if (!rows.length) break;

    let added = 0;
    for (const [index, row] of rows.entries()) {
      const item = mapReview(row, (page - 1) * 20 + index);
      if (!item) continue;
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      mapped.push(item);
      added += 1;
    }

    // Duplicate-only page means we've exhausted the feed
    if (added === 0) break;
  }

  return mapped;
}

export function elfsightGoogleMapsUrl() {
  return `https://www.google.com/maps/place/?q=place_id:${ELFSIGHT_GOOGLE_PLACE_ID}`;
}
