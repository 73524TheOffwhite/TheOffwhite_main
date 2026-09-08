import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { level4Description } from "@/data/levels";
import { useLevel4Cms } from "@/lib/level4-cms";
import { cmsSrc } from "@/lib/cms-src";

import spaceLevel4Interior from "@/assets/space-level4-interior.jpg";
import spaceBrand from "@/assets/space-brand.jpg";
import kitchenBarLevel4 from "@/assets/kitchen-bar-level4.jpg";

export const Route = createFileRoute("/level-4-dining")({
  head: () => ({
    meta: [
      { title: "Level 4 — Fine Dining & Bar | The Off White" },
      {
        name: "description",
        content:
          "Level 4 at The Off White — slow dinners, crafted cocktails and conversations that deserve time.",
      },
      { property: "og:title", content: "Level 4 — Fine Dining & Bar" },
      {
        property: "og:description",
        content: "For conversations that deserve time.",
      },
    ],
  }),
  component: Level4Page,
});

const ease = [0.22, 1, 0.36, 1] as const;

function SunFlowerIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.15"
      strokeLinecap="round"
    >
      <circle cx="14" cy="14" r="4.5" />
      <line x1="14" y1="3" x2="14" y2="6" />
      <line x1="14" y1="22" x2="14" y2="25" />
      <line x1="3" y1="14" x2="6" y2="14" />
      <line x1="22" y1="14" x2="25" y2="14" />
      <line x1="6.2" y1="6.2" x2="8.4" y2="8.4" />
      <line x1="19.6" y1="19.6" x2="21.8" y2="21.8" />
      <line x1="21.8" y1="6.2" x2="19.6" y2="8.4" />
      <line x1="8.4" y1="19.6" x2="6.2" y2="21.8" />
    </svg>
  );
}

function CtaLink({
  label,
  onClick,
  to,
  hash,
}: {
  label: string;
  onClick?: () => void;
  to?: string;
  hash?: string;
}) {
  const className =
    "group inline-flex flex-col items-start gap-3 text-[9.5px] sm:text-[10px] uppercase tracking-[0.28em] font-semibold text-[var(--ink)] touch-manipulation";

  const inner = (
    <>
      <span className="block h-px w-10 bg-[var(--ink)]/25 transition-all duration-300 group-hover:w-14 group-hover:bg-[var(--gold)]" />
      <span className="inline-flex items-center gap-2 transition-colors duration-300 group-hover:text-[var(--cocoa)]">
        {label}
        <span
          aria-hidden
          className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
        >
          →
        </span>
      </span>
    </>
  );

  if (to) {
    return (
      <Link to={to} hash={hash} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

function ParallaxImage({
  src,
  alt,
  className = "",
  containerClassName = "",
}: {
  src?: string;
  alt: string;
  className?: string;
  containerClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  return (
    <div ref={ref} className={`relative overflow-hidden group ${containerClassName}`}>
      <motion.div style={{ y }} className="absolute inset-0 will-change-transform">
        {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04] ${className}`}
        />
        ) : null}
      </motion.div>
    </div>
  );
}

function splitHref(href: string) {
  const [path, hash] = href.split("#");
  return { to: path || "/contact", hash };
}

function Level4Page() {
  const { data: cms, isPending } = useLevel4Cms();
  const scrollToDiscover = useCallback(() => {
    const target =
      document.getElementById("discover") ?? document.getElementById("discover-mobile");
    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const eyebrow = cms?.hero.eyebrow || "Level 4";
  const headline = cms?.hero.headline || "For conversations that deserve time.";
  const body =
    cms?.hero.body ||
    "The kind of evening you'll remember next year. Not because of what you ate. Because of who you shared it with.";
  const heroButton = cms?.hero.buttonLabel || "Explore Level 4";

  const dining = cms?.collage.find((s) => s.id === "dining");
  const brand = cms?.collage.find((s) => s.id === "brand");
  const bar = cms?.collage.find((s) => s.id === "bar");
  const diningSrc = cmsSrc(isPending, dining?.imageUrl, spaceLevel4Interior);
  const brandSrc = cmsSrc(isPending, brand?.imageUrl, spaceBrand);
  const barSrc = cmsSrc(isPending, bar?.imageUrl, kitchenBarLevel4);
  const diningAlt =
    dining?.alt || "Level 4 dining room with woven pendants, stone walls and neon sign";
  const brandAlt = brand?.alt || "Arched niches with sculptures and warm ambient lighting";
  const barAlt = bar?.alt || "Level 4 bar with bamboo slats and curved bottle display";

  const quoteLines = cms?.mood.quoteLines?.length
    ? cms.mood.quoteLines
    : ["The light changes.", "The mood changes.", "The evening unfolds."];
  const moodButton = cms?.mood.button || { label: "Discover More", href: "/contact#reserve" };
  const moodLink = splitHref(moodButton.href);

  return (
    <div className="overflow-x-hidden bg-[#F5F1E9]">
      <section className="pt-28 sm:pt-32 pb-0 lg:min-h-[calc(100svh-5rem)]">
        <div className="mx-auto max-w-[1440px]">
          {/* Desktop asymmetrical grid */}
          <div className="hidden lg:grid lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)_minmax(0,0.72fr)] lg:min-h-[calc(100svh-8rem)]">
            {/* Top left — hero copy */}
            <motion.div
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease }}
              className="col-span-5 row-span-1 bg-[#F5F1E9] flex flex-col justify-center px-12 xl:px-16 2xl:px-20 py-16"
            >
              <p className="text-[10px] uppercase tracking-[0.34em] font-medium text-[var(--gold)]">
                {eyebrow}
              </p>

              <h1
                className="mt-6 heading-hero text-[var(--ink)] leading-[1.1] max-w-[340px]"
                style={{ fontSize: "clamp(2.4rem, 3.2vw, 3.5rem)" }}
              >
                {headline}
              </h1>

              <div className="mt-8 flex gap-8 items-stretch max-w-[360px]">
                <div className="w-px shrink-0 bg-[var(--ink)]/15 self-stretch min-h-[72px]" />
                <p className="text-[13px] sm:text-[13.5px] text-[var(--ink-muted)] leading-[1.95] pt-0.5">
                  {body}
                </p>
              </div>

              <div className="mt-10">
                <CtaLink label={heroButton} onClick={scrollToDiscover} />
              </div>
            </motion.div>

            {/* Top right — dining */}
            <motion.div
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.12, ease }}
              className="col-span-7 row-span-1 min-h-[420px]"
            >
              <ParallaxImage
                src={diningSrc}
                alt={diningAlt}
                containerClassName="h-full min-h-[420px]"
              />
            </motion.div>

            {/* Bottom left — decor niches */}
            <Reveal className="col-span-4 row-span-1 min-h-[300px]">
              <ParallaxImage
                src={brandSrc}
                alt={brandAlt}
                containerClassName="h-full min-h-[300px]"
              />
            </Reveal>

            {/* Bottom center — mood copy */}
            <Reveal
              delay={0.1}
              className="col-span-3 row-span-1 bg-[#F5F1E9] flex flex-col justify-center px-8 xl:px-10 py-10"
            >
              <div id="discover" className="scroll-mt-32">
                <div className="text-[var(--gold)] mb-6">
                  <SunFlowerIcon />
                </div>
                <p
                  className="font-serif text-[var(--ink)] leading-[1.35]"
                  style={{ fontSize: "clamp(1.35rem, 1.8vw, 1.75rem)" }}
                >
                  {quoteLines.map((line, i) => (
                    <span key={`${line}-${i}`}>
                      {i > 0 ? <br /> : null}
                      {line}
                    </span>
                  ))}
                </p>
                <div className="mt-8">
                  <CtaLink label={moodButton.label} to={moodLink.to} hash={moodLink.hash} />
                </div>
              </div>
            </Reveal>

            {/* Bottom right — bar */}
            <Reveal delay={0.15} className="col-span-5 row-span-1 min-h-[300px]">
              <ParallaxImage
                src={barSrc}
                alt={barAlt}
                containerClassName="h-full min-h-[300px]"
              />
            </Reveal>
          </div>

          {/* Mobile / tablet stacked layout */}
          <div className="lg:hidden">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease }}
              className="px-6 sm:px-8 py-10 sm:py-12 bg-[#F5F1E9]"
            >
              <p className="text-[10px] uppercase tracking-[0.34em] font-medium text-[var(--gold)]">
                {eyebrow}
              </p>
              <h1 className="mt-5 heading-hero text-[var(--ink)] text-[clamp(2rem,7vw,2.75rem)] leading-[1.12] max-w-[400px]">
                {headline}
              </h1>
              <div className="mt-7 flex gap-6 items-stretch">
                <div className="w-px shrink-0 bg-[var(--ink)]/15" />
                <p className="text-[13.5px] text-[var(--ink-muted)] leading-[1.92]">
                  {body}
                </p>
              </div>
              <div className="mt-8">
                <CtaLink label={heroButton} onClick={scrollToDiscover} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.1, ease }}
              className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden group"
            >
              <img
                src={diningSrc}
                alt={dining?.alt || "Level 4 dining room"}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.3s] group-hover:scale-[1.03]"
                loading="eager"
              />
            </motion.div>

            <Reveal>
              <div className="relative aspect-square sm:aspect-[5/4] overflow-hidden group">
                <img
                  src={brandSrc}
                  alt={brand?.alt || "Decorative arched niches"}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.3s] group-hover:scale-[1.03]"
                />
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div id="discover-mobile" className="scroll-mt-32 px-6 sm:px-8 py-12 bg-[#F5F1E9]">
                <div className="text-[var(--gold)] mb-5">
                  <SunFlowerIcon />
                </div>
                <p className="font-serif text-[var(--ink)] text-[clamp(1.4rem,5vw,1.85rem)] leading-[1.35]">
                  {quoteLines.map((line, i) => (
                    <span key={`${line}-${i}`}>
                      {i > 0 ? <br /> : null}
                      {line}
                    </span>
                  ))}
                </p>
                <div className="mt-8">
                  <CtaLink label={moodButton.label} to={moodLink.to} hash={moodLink.hash} />
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="relative aspect-[4/3] overflow-hidden group">
                <img
                  src={barSrc}
                  alt={bar?.alt || "Level 4 bar"}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.3s] group-hover:scale-[1.03]"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Level4Story />
    </div>
  );
}

function Level4Story() {
  const { data: cms } = useLevel4Cms();
  const eyebrow = cms?.story.eyebrow || level4Description.eyebrow;
  const title = cms?.story.title || level4Description.title;
  const intro = cms?.story.intro || level4Description.intro;
  const paragraphs =
    cms?.story.paragraphs?.length ? cms.story.paragraphs : level4Description.paragraphs;
  const features = cms?.story.features?.length
    ? cms.story.features.map((f) => f.label)
    : level4Description.features;

  return (
    <section className="bg-[#F5F1E9] px-6 sm:px-8 lg:px-12 py-20 lg:py-28">
      <div className="mx-auto max-w-[1080px]">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.34em] font-medium text-[var(--gold)]">
            {eyebrow}
          </p>
          <h2
            className="mt-5 font-serif text-[var(--ink)] leading-[1.18]"
            style={{ fontSize: "clamp(1.7rem, 3vw, 2.6rem)" }}
          >
            {title}
          </h2>
          <p className="mt-7 text-[15px] sm:text-base text-[var(--ink-muted)] leading-[1.95] max-w-[760px]">
            {intro}
          </p>
        </Reveal>

        <div className="mt-10 space-y-6 max-w-[760px]">
          {paragraphs.map((para, i) => (
            <Reveal key={i} delay={0.05 + i * 0.04}>
              <p className="text-[14.5px] sm:text-[15px] text-[var(--ink-muted)] leading-[1.95]">
                {para}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap gap-3">
            {features.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--ink)]/15 bg-white/40 px-4 py-2 text-[10.5px] uppercase tracking-[0.2em] font-medium text-[var(--ink)]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                {f}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
