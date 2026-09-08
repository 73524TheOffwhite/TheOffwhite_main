import { useQuery } from "@tanstack/react-query";
import { Quote, Star } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";
import testimonialsDecor from "@/assets/testimonials-decor.png";
import { useTestimonials } from "@/lib/testimonials";
import { useHomepageCms } from "@/lib/homepage-cms";
import { cmsSrc } from "@/lib/cms-src";

const EMBED_ID = "25705374";
const FEED_URL = `https://data.accentapi.com/feed/${EMBED_ID}.json`;
const DISPLAY_COUNT = 5;

type SkReview = {
  id?: string;
  reviewer_name?: string;
  review_text?: string;
  review_text_raw?: string;
  rating?: string | number;
  review_date_time?: string;
};

type SkFeed = {
  bio?: { overall_star_rating?: number; rating_count?: number };
  reviews?: SkReview[];
};

type DisplayReview = {
  id: string;
  quote: string;
  author: string;
  postedWhen: string;
  rating: number;
};

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripHtml(text: string): string {
  return decodeEntities(
    text
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<\/p>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function cleanQuote(text: string): string {
  return stripHtml(text)
    .replace(/\b(Food|Service|Atmosphere)\s*:\s*\d+/gi, " ")
    .replace(
      /\b(Order type|Meal type|Price per person|Noise level|Group size|Wait time|Reservation|Parking space|Parking options|Parking type|Recommendation for vegetarians|Vegetarian offerings|Seating type|Recommended dishes)\b[^,]{0,80}/gi,
      " ",
    )
    .replace(/\s+/g, " ")
    .trim();
}

function relativeTime(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const days = Math.max(0, Math.round((Date.now() - t) / 86_400_000));
  if (days < 1) return "today";
  if (days === 1) return "a day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return months === 1 ? "a month ago" : `${months} months ago`;
  const years = Math.round(days / 365);
  return years === 1 ? "a year ago" : `${years} years ago`;
}

async function fetchSociableKitReviews(): Promise<{
  rating: number;
  reviews: DisplayReview[];
}> {
  const res = await fetch(`${FEED_URL}?nocache=${Date.now()}`);
  if (!res.ok) throw new Error(`Reviews feed failed (${res.status})`);
  const data = (await res.json()) as SkFeed;

  const reviews = (data.reviews || [])
    .map((review, index) => {
      const quote = cleanQuote(review.review_text_raw || review.review_text || "");
      const rating = Number(review.rating) || 0;
      return {
        id: String(review.id || `sk-${index}`),
        quote,
        author: review.reviewer_name || "Google user",
        postedWhen: relativeTime(review.review_date_time || ""),
        rating,
      };
    })
    .filter((review) => review.quote.length > 40 && review.rating > 0)
    .slice(0, DISPLAY_COUNT);

  return {
    rating: data.bio?.overall_star_rating || 5,
    reviews,
  };
}

export function SociableKitGoogleReviews() {
  const { googleReviewsUrl } = useTestimonials();
  const { data: cms, isPending } = useHomepageCms();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["sociablekit-google-reviews", EMBED_ID],
    queryFn: fetchSociableKitReviews,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const eyebrow = cms?.testimonialsSection.eyebrow || "What Our Guests Say";
  const ratingLine =
    cms?.testimonialsSection.ratingLine ||
    (data?.rating
      ? `Rated ${data.rating.toFixed(1)} by our guests on Google`
      : "Rated 5.0 by our guests on Google");
  const buttonLabel = cms?.testimonialsSection.buttonLabel || "Read More Reviews on Google";
  const decorSrc = cmsSrc(isPending, cms?.testimonialsSection.decorImageUrl, testimonialsDecor);

  if (isLoading || isError || !data?.reviews.length) return null;

  return (
    <section className="bg-[var(--cream)] py-24 lg:py-28" aria-label="Google reviews">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <Reveal className="text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <div className="mt-5 flex items-center justify-center gap-2 text-[var(--gold)]">
            {Array.from({ length: 5 }).map((_, k) => (
              <Star key={k} size={16} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <p className="mt-3 text-sm text-[var(--ink-muted)]">{ratingLine}</p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:items-stretch">
          {data.reviews.map((r, i) => (
            <Reveal key={r.id} delay={(i % 3) * 0.1} className="h-full min-w-0">
              <figure className="flex h-full min-w-0 flex-col overflow-hidden bg-[var(--cream-warm)] p-8 lg:p-9 rounded-sm transition-transform hover:-translate-y-1 duration-500">
                <Quote className="text-[var(--gold)]" size={24} />
                <div className="mt-4 flex items-center gap-1 text-[var(--gold)]">
                  {Array.from({ length: r.rating }).map((_, k) => (
                    <Star key={k} size={13} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="mt-4 min-w-0 flex-1 overflow-hidden italic text-[var(--ink-muted)] leading-[1.85] text-[14.5px] line-clamp-6">
                  {r.quote}
                </blockquote>
                <figcaption className="mt-6 shrink-0">
                  <p className="truncate text-sm text-[var(--ink)]">{r.author}</p>
                  {r.postedWhen ? (
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                      {r.postedWhen}
                    </p>
                  ) : null}
                </figcaption>
              </figure>
            </Reveal>
          ))}

          <Reveal delay={0.2} className="hidden lg:block">
            <div className="h-full min-h-[240px] w-full overflow-hidden arch-top">
              {decorSrc ? (
                <img
                  src={decorSrc}
                  alt="The Off White Level 4"
                  className="h-full w-full object-cover"
                  width={768}
                  height={1024}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </div>
          </Reveal>
        </div>

        <Reveal className="mt-12 text-center">
          <a
            href={googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            {buttonLabel}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
