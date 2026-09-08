import { useQuery } from "@tanstack/react-query";
import { guestReviews, googleReviewsUrl } from "@/data/testimonials";
import { fetchElfsightGoogleReviews } from "@/lib/elfsight-google-reviews";

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  meta: string;
  postedWhen: string;
  rating: number;
};

const DEFAULT_TESTIMONIALS: Testimonial[] = guestReviews.map((review, index) => ({
  id: `fallback-${index}`,
  quote: review.quote,
  author: review.name,
  meta: review.meta,
  postedWhen: review.when,
  rating: review.rating,
}));

async function supabaseFetch<T>(path: string): Promise<T | null> {
  const url = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;

  const response = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (!response.ok) return null;
  return (await response.json()) as T;
}

async function fetchCmsTestimonials(): Promise<Testimonial[]> {
  const rows = await supabaseFetch<
    Array<{
      id: string;
      quote: string;
      author: string;
      meta: string | null;
      posted_when: string | null;
      rating: number;
    }>
  >(
    "testimonials?select=id,quote,author,meta,posted_when,rating&is_active=eq.true&show_on_home=eq.true&status=eq.published&order=sort_order.asc",
  );

  if (!rows?.length) return DEFAULT_TESTIMONIALS;

  return rows.map((row) => ({
    id: row.id,
    quote: row.quote,
    author: row.author,
    meta: row.meta || "",
    postedWhen: row.posted_when || "",
    rating: row.rating,
  }));
}

async function fetchHomeTestimonials(): Promise<Testimonial[]> {
  try {
    const live = await fetchElfsightGoogleReviews();
    if (live.length) {
      return live.map((review) => ({
        id: review.id,
        quote: review.quote,
        author: review.author,
        meta: "",
        postedWhen: review.postedWhen,
        rating: review.rating,
      }));
    }
  } catch (error) {
    console.warn("[Testimonials] Elfsight Google reviews failed, using fallback.", error);
  }

  return fetchCmsTestimonials();
}

async function fetchGoogleReviewsUrl(): Promise<string> {
  const rows = await supabaseFetch<Array<{ key: string; value: string }>>(
    "site_settings?select=key,value&key=eq.google_reviews_url",
  );
  return rows?.[0]?.value || googleReviewsUrl;
}

export function useTestimonials() {
  const testimonialsQuery = useQuery({
    queryKey: ["testimonials", "home", "elfsight-google-reviews", "all"],
    queryFn: fetchHomeTestimonials,
    placeholderData: DEFAULT_TESTIMONIALS,
    staleTime: 15 * 60 * 1000,
  });

  const reviewsUrlQuery = useQuery({
    queryKey: ["google-reviews-url"],
    queryFn: fetchGoogleReviewsUrl,
    initialData: googleReviewsUrl,
    staleTime: 5 * 60 * 1000,
  });

  return {
    testimonials: testimonialsQuery.data,
    googleReviewsUrl: reviewsUrlQuery.data,
  };
}
