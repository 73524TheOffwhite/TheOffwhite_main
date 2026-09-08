import { useEffect, useState } from "react";
import { Reveal } from "../Reveal";
import { Eyebrow } from "../Eyebrow";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import testimonialsDecor from "@/assets/testimonials-decor.png";
import { useTestimonials } from "@/lib/testimonials";
import { useHomepageCms } from "@/lib/homepage-cms";
import { cmsSrc } from "@/lib/cms-src";
import { TESTIMONIALS_INITIAL_VISIBLE } from "@/lib/elfsight-google-reviews";

const PAGE_SIZE = TESTIMONIALS_INITIAL_VISIBLE;
const FADE_MS = 280;

export function Testimonials() {
  const { testimonials, googleReviewsUrl } = useTestimonials();
  const { data, isPending } = useHomepageCms();
  const eyebrow = data?.testimonialsSection.eyebrow || "What Our Guests Say";
  const ratingLine = data?.testimonialsSection.ratingLine || "Rated 5.0 by our guests on Google";
  const buttonLabel = data?.testimonialsSection.buttonLabel || "Read More Reviews on Google";
  const decorSrc = cmsSrc(isPending, data?.testimonialsSection.decorImageUrl, testimonialsDecor);

  const totalPages = Math.max(1, Math.ceil(testimonials.length / PAGE_SIZE));
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(true);
  const [pendingPage, setPendingPage] = useState<number | null>(null);

  useEffect(() => {
    setPage(0);
    setPendingPage(null);
    setVisible(true);
  }, [testimonials]);

  useEffect(() => {
    if (pendingPage === null) return;
    setVisible(false);
    const timer = window.setTimeout(() => {
      setPage(pendingPage);
      setPendingPage(null);
      setVisible(true);
    }, FADE_MS);
    return () => window.clearTimeout(timer);
  }, [pendingPage]);

  const goTo = (next: number) => {
    if (next < 0 || next >= totalPages || next === page || pendingPage !== null) return;
    setPendingPage(next);
  };

  const pageReviews = testimonials.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const canPrev = page > 0;
  const canNext = page < totalPages - 1;

  return (
    <section className="bg-[var(--cream)] py-24 lg:py-28">
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
          {pageReviews.map((r) => (
            <div
              key={`${page}-${r.id}`}
              className={`h-full min-w-0 transition-opacity duration-300 ease-out ${
                visible ? "opacity-100" : "opacity-0"
              }`}
            >
              <figure className="flex h-full min-h-[320px] flex-col overflow-hidden bg-[var(--cream-warm)] p-8 lg:min-h-[360px] lg:p-9 rounded-sm transition-transform hover:-translate-y-1 duration-500">
                <Quote className="shrink-0 text-[var(--gold)]" size={24} />
                <div className="mt-4 flex shrink-0 items-center gap-1 text-[var(--gold)]">
                  {Array.from({ length: Math.max(1, r.rating) }).map((_, k) => (
                    <Star key={k} size={13} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="mt-4 min-h-[9.5rem] flex-1 overflow-hidden italic text-[var(--ink-muted)] leading-[1.85] text-[14.5px] line-clamp-7">
                  {r.quote}
                </blockquote>
                <figcaption className="mt-auto shrink-0 pt-6">
                  <p className="truncate text-sm text-[var(--ink)]">{r.author}</p>
                  {(r.meta || r.postedWhen) && (
                    <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--ink-muted)]">
                      {[r.meta, r.postedWhen].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </figcaption>
              </figure>
            </div>
          ))}

          <div className="hidden h-full min-w-0 lg:block">
            <div className="h-full min-h-[360px] w-full overflow-hidden arch-top">
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
          </div>
        </div>

        {totalPages > 1 ? (
          <div className="mt-10 flex items-center justify-center gap-5">
            <button
              type="button"
              aria-label="Previous reviews"
              disabled={!canPrev || pendingPage !== null}
              onClick={() => goTo(page - 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ink)]/20 text-[var(--ink)] transition-opacity hover:border-[var(--gold)]/50 hover:text-[var(--gold)] disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
            <span className="min-w-[3rem] text-center text-[11px] uppercase tracking-[0.18em] text-[var(--ink-muted)]">
              {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              aria-label="Next reviews"
              disabled={!canNext || pendingPage !== null}
              onClick={() => goTo(page + 1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--ink)]/20 text-[var(--ink)] transition-opacity hover:border-[var(--gold)]/50 hover:text-[var(--gold)] disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight size={18} strokeWidth={1.75} />
            </button>
          </div>
        ) : null}

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
