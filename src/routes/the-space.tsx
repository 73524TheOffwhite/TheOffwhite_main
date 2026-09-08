import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Leaf,
  Heart,
  Sun,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import spaceEntrance from "@/assets/space-entrance.jpg";
import spaceLevel4Interior from "@/assets/space-level4-interior.jpg";
import spaceGridPendants from "@/assets/space-grid-pendants.jpg";
import spaceGridCorridor from "@/assets/space-grid-corridor.jpg";
import spaceGridDining from "@/assets/space-grid-dining.jpg";
import niche from "@/assets/niche.jpg";
import spaceLevel5Interior from "@/assets/space-level5-dining.jpg";
import spaceMemoryCocktail from "@/assets/space-memory-cocktail.jpg";
import spaceMemoryDining from "@/assets/space-memory-dining.jpg";
import spaceMemoryFamily from "@/assets/space-memory-family.jpg";
import spaceMemoryCelebrity from "@/assets/space-memory-celebrity.jpg";
import level4Decor from "@/assets/level4-decor.png";
import level5Decor from "@/assets/level5-decor.png";
import { useSpaceCms } from "@/lib/space-cms";
import { cmsSrc } from "@/lib/cms-src";

export const Route = createFileRoute("/the-space")({
  head: () => ({
    meta: [
      { title: "The Space — The Off White" },
      {
        name: "description",
        content:
          "Every curve, every arch and every material reflects a deep respect for nature, craft and calm.",
      },
      { property: "og:title", content: "The Space — The Off White" },
      {
        property: "og:description",
        content: "Designed to be experienced. Mediterranean architecture and soul in Navelim, South Goa.",
      },
    ],
  }),
  component: SpacePage,
});

const ease = [0.22, 1, 0.36, 1] as const;

const fallbackGridImages = [
  {
    id: "gridTL",
    src: niche,
    alt: "Arched stone niche with dried pampas grass",
    placement: "col-start-2 row-start-1",
  },
  {
    id: "gridTR",
    src: spaceGridPendants,
    alt: "Woven rattan pendant lights with warm golden glow",
    placement: "col-start-3 row-start-1",
  },
  {
    id: "gridBL",
    src: spaceGridCorridor,
    alt: "Stone arch corridor with bougainvillea and sea view",
    placement: "col-start-2 row-start-2",
  },
  {
    id: "gridBR",
    src: spaceGridDining,
    alt: "Sunlit dining room with woven pendant lights and stone arches",
    placement: "col-start-3 row-start-2",
  },
];

const fallbackMemoryQuotes = [
  { text: "We got engaged here! Everything was perfect.", author: "Priya & Arjun" },
  { text: "The attention to detail is unmatched. The space, the service, the flavours — simply outstanding.", author: "Arjun R." },
  { text: "Felt like a vacation in the Mediterranean. Our new favourite spot in Goa!", author: "Neha D." },
  { text: "A hidden gem! The ambiance, the food, everything was absolutely perfect.", author: "Priya M." },
];

const fallbackMemorySlides = [
  { type: "image" as const, src: spaceMemoryCelebrity, alt: "Guests at The Off White under the neon sign" },
  { type: "image" as const, src: spaceMemoryFamily, alt: "Family celebration at The Off White" },
  { type: "quote" as const },
  { type: "image" as const, src: spaceMemoryDining, alt: "Gourmet appetizers and drinks at The Off White" },
  { type: "image" as const, src: spaceMemoryCocktail, alt: "Craft cocktail being poured at The Off White bar" },
];

const pillarIconMap: Record<"leaf" | "heart" | "sun" | "users", LucideIcon> = {
  leaf: Leaf,
  heart: Heart,
  sun: Sun,
  users: Users,
};

const fallbackPillars = [
  { Icon: Leaf, label: "Honest\nIngredients", customIconUrl: undefined as string | undefined },
  { Icon: Heart, label: "Warm\nHospitality", customIconUrl: undefined as string | undefined },
  { Icon: Sun, label: "Beautiful\nAmbience", customIconUrl: undefined as string | undefined },
  { Icon: Users, label: "Meaningful\nExperiences", customIconUrl: undefined as string | undefined },
];

function titleLines(title: string, fallback: [string, string]) {
  if (title.includes("\n")) return title.split("\n");
  if (title.includes(" / ")) return title.split(/\s*\/\s*/).map((p) => p.trim()).filter(Boolean);
  if (/evening/i.test(title)) return ["The Evening", "Chapter"];
  if (/celebration/i.test(title)) return ["The Celebration", "Chapter"];
  return fallback;
}

function SpacePage() {
  const { data, isPending } = useSpaceCms();

  const heroEyebrow = data?.hero.eyebrow || "The Space";
  const heroHeadline = data?.hero.headline || "Designed to be experienced.";
  const heroBody =
    data?.hero.body ||
    "Every curve, every arch and every material reflects a deep respect for nature, craft and calm.";
  const heroButton = data?.hero.button || { label: "Explore The Space", href: "#gallery" };

  const tallFallback = {
    src: spaceEntrance,
    alt: "The Off White — arched entrance with neon sign and tropical greenery",
  };
  const tallCms = data?.hero.collage?.find((s) => s.id === "tall");
  const tallImage = {
    src: cmsSrc(isPending, tallCms?.imageUrl, tallFallback.src),
    alt: tallCms?.alt || tallFallback.alt,
  };

  const gridImages = fallbackGridImages.map((fallback) => {
    const cms = data?.hero.collage?.find((s) => s.id === fallback.id);
    return {
      ...fallback,
      src: cmsSrc(isPending, cms?.imageUrl, fallback.src),
      alt: cms?.alt || fallback.alt,
    };
  });

  const memoryQuotes =
    data?.memories.quotes?.length
      ? data.memories.quotes.map((q) => ({ text: q.text, author: q.author }))
      : fallbackMemoryQuotes;

  const memorySlides =
    data?.memories.slides?.length
      ? data.memories.slides.map((slide, i) => {
          if (slide.type === "quote") return { type: "quote" as const };
          const fb = fallbackMemorySlides.filter((s) => s.type === "image");
          const fbImg = fb[i % fb.length] as Extract<(typeof fallbackMemorySlides)[number], { type: "image" }>;
          return {
            type: "image" as const,
            src: cmsSrc(isPending, slide.imageUrl, fbImg.src),
            alt: slide.alt || fbImg.alt,
          };
        })
      : fallbackMemorySlides.map((s) =>
          s.type === "image"
            ? { type: "image" as const, src: cmsSrc(isPending, undefined, s.src), alt: s.alt }
            : s,
        );

  const memoriesEyebrow = data?.memories.eyebrow || "Memories Made Here";
  const experiencesEyebrow = data?.experiences.eyebrow || "Choose Your Experience";

  const level4Cms = data?.experiences.levels?.find((l) => /level\s*4/i.test(l.levelLabel) || l.id === "level-4");
  const level5Cms = data?.experiences.levels?.find((l) => /level\s*5/i.test(l.levelLabel) || l.id === "level-5");
  const level4 = {
    level: level4Cms?.levelLabel || "Level 4",
    titleLines: titleLines(level4Cms?.title || "The Evening / Chapter", ["The Evening", "Chapter"]),
    description:
      level4Cms?.description ||
      "For the ones who love slow dinners, crafted cocktails and long conversations.",
    image: cmsSrc(isPending, level4Cms?.imageUrl, spaceLevel4Interior),
    imageAlt:
      level4Cms?.imageAlt ||
      "Level 4 — The Off White dining room with neon sign and woven pendant lights",
    to: (level4Cms?.button.href || "/level-4-dining") as "/level-4-dining" | "/level-5-events",
    cta: level4Cms?.button.label || "Explore Level 4",
    decor: cmsSrc(isPending, level4Cms?.decorImageUrl, level4Decor),
  };
  const level5 = {
    level: level5Cms?.levelLabel || "Level 5",
    titleLines: titleLines(level5Cms?.title || "The Celebration / Chapter", ["The Celebration", "Chapter"]),
    description:
      level5Cms?.description ||
      "For the big moments, the beautiful chaos and the memories that bring everyone together.",
    image: cmsSrc(isPending, level5Cms?.imageUrl, spaceLevel5Interior),
    imageAlt:
      level5Cms?.imageAlt ||
      "Level 5 — airy dining space with woven pendants, arched doorway and stone floor",
    to: (level5Cms?.button.href || "/level-5-events") as "/level-4-dining" | "/level-5-events",
    cta: level5Cms?.button.label || "Explore Level 5",
    decor: cmsSrc(isPending, level5Cms?.decorImageUrl, level5Decor),
  };

  const philosophyHeadline = data?.philosophy.headline || "Our Philosophy";
  const philosophyBody =
    data?.philosophy.body ||
    "We believe in honest food, warm hospitality and creating a space where everyone feels at home.";
  const philosophyHighlight =
    data?.philosophy.highlight || "Good food. Good people. Good memories.";
  const philosophyWordmark = data?.philosophy.wordmark || "forever.";
  const pillars =
    data?.philosophy.pillars?.length
      ? data.philosophy.pillars.map((pillar) => ({
          Icon: pillar.icon === "custom" ? Leaf : pillarIconMap[pillar.icon] || Leaf,
          label: pillar.label.includes("\n") ? pillar.label : pillar.label.replace(/\s+/, "\n"),
          customIconUrl: pillar.customIconUrl,
        }))
      : fallbackPillars;

  return (
    <div className="overflow-x-hidden safe-pl safe-pr">
    <section className="bg-[var(--cream)] lg:min-h-screen overflow-x-hidden">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12 xl:px-16 pt-28 sm:pt-32 pb-14 sm:pb-20 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.40fr)_minmax(0,0.60fr)] gap-10 sm:gap-12 lg:gap-14 xl:gap-16 items-start lg:items-center min-h-0 lg:min-h-[calc(100svh-10rem)]">

          {/* Left — copy */}
          <div className="lg:py-8 xl:pr-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease }}
              className="text-[11px] uppercase tracking-[0.28em] sm:tracking-[0.34em] font-medium text-[var(--gold)]"
            >
              {heroEyebrow}
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 32, clipPath: "inset(0 0 100% 0)" }}
              animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
              transition={{ delay: 0.12, duration: 1.05, ease }}
              className="mt-5 lg:mt-6 heading-hero text-[clamp(1.9rem,7.5vw,3.65rem)] sm:text-[clamp(2.35rem,4.4vw,3.65rem)] text-[var(--ink)] leading-[1.12] max-w-[480px]"
            >
              {heroHeadline}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.9, ease }}
              className="mt-6 lg:mt-7 text-[var(--ink-muted)] text-[14px] sm:text-[15px] leading-[1.92] max-w-[400px]"
            >
              {heroBody}
            </motion.p>

            <motion.a
              href={heroButton.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.85, ease }}
              className="mt-8 lg:mt-10 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] font-semibold text-[var(--gold)] hover:text-[var(--cocoa)] transition-colors duration-300 group"
            >
              {heroButton.label}
              <span
                aria-hidden
                className="inline-block transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </motion.a>
          </div>

          {/* Right — 5-image grid: 1 portrait + 2×2 squares */}
          <motion.div
            id="gallery"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease }}
            className="w-full lg:max-w-[760px] lg:ml-auto"
          >
            {/* Mobile / tablet: portrait + 2×2 */}
            <div className="grid grid-cols-[1.5fr_1fr_1fr] grid-rows-2 gap-2 h-[300px] sm:h-[360px] md:h-[420px] lg:hidden">
              <div className="row-span-2 col-start-1 row-start-1 overflow-hidden group h-full">
                {tallImage.src ? (
                <img
                  src={tallImage.src}
                  alt={tallImage.alt}
                  loading="eager"
                  className="w-full h-full object-cover object-center transition-transform duration-[1.4s] ease-out group-hover:scale-[1.03]"
                />
                ) : null}
              </div>
              {gridImages.map((img) => (
                <div key={img.alt} className={`${img.placement} overflow-hidden group h-full min-h-0`}>
                  {img.src ? (
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-[1.4s] ease-out group-hover:scale-[1.03]"
                  />
                  ) : null}
                </div>
              ))}
            </div>

            {/* Desktop: exact replica grid */}
            <div className="hidden lg:grid grid-cols-[1.7fr_1fr_1fr] grid-rows-2 gap-2 h-[580px]">
              <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.95, ease }}
                className="row-span-2 col-start-1 row-start-1 overflow-hidden group h-full"
              >
                {tallImage.src ? (
                <img
                  src={tallImage.src}
                  alt={tallImage.alt}
                  width={768}
                  height={1024}
                  loading="eager"
                  className="w-full h-full object-cover object-center transition-transform duration-[1.4s] ease-out group-hover:scale-[1.03]"
                />
                ) : null}
              </motion.div>

              {gridImages.map((img, i) => (
                <motion.div
                  key={img.alt}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.36 + i * 0.07, duration: 0.85, ease }}
                  className={`${img.placement} overflow-hidden group h-full min-h-0`}
                >
                  {img.src ? (
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className="w-full h-full object-cover object-center transition-transform duration-[1.4s] ease-out group-hover:scale-[1.03]"
                  />
                  ) : null}
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>

    <MemoriesSection
      eyebrow={memoriesEyebrow}
      quotes={memoryQuotes}
      slides={memorySlides}
    />
    <ChooseExperienceSection
      eyebrow={experiencesEyebrow}
      level4={level4}
      level5={level5}
    />
    <PhilosophySection
      headline={philosophyHeadline}
      body={philosophyBody}
      highlight={philosophyHighlight}
      wordmark={philosophyWordmark}
      pillars={pillars}
    />

    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <Reveal className="text-center">
      <p className="text-[11px] uppercase tracking-[0.34em] font-medium text-[var(--ink-muted)]">
        — {children} —
      </p>
      <div className="mx-auto mt-4 h-px w-12 bg-[var(--border)]" />
    </Reveal>
  );
}

function QuoteCard({ quotes }: { quotes: Array<{ text: string; author: string }> }) {
  const safeQuotes = quotes.length ? quotes : fallbackMemoryQuotes;
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setQuoteIndex((i) => (i + 1) % safeQuotes.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, [safeQuotes.length]);

  const quote = safeQuotes[quoteIndex % safeQuotes.length];

  return (
    <div className="flex flex-col justify-center rounded-md aspect-[4/5] bg-[var(--cream-warm)] px-4 py-6 sm:px-5 sm:py-7 shadow-[0_8px_30px_-12px_rgba(43,33,24,0.12)]">
      <svg viewBox="0 0 32 24" className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--gold)] mb-3 shrink-0" fill="currentColor">
        <path d="M0 24V14.4C0 6.4 4.8 1.6 14.4 0l1.6 3.2C11.2 4.48 8.64 7.2 8 11.2H14.4V24H0zm17.6 0V14.4C17.6 6.4 22.4 1.6 32 0l1.6 3.2C28.8 4.48 26.24 7.2 25.6 11.2H32V24H17.6z" />
      </svg>
      <AnimatePresence mode="wait">
        <motion.div
          key={quoteIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease }}
        >
          <p className="font-serif text-[var(--ink)] text-[0.875rem] sm:text-[0.9rem] leading-[1.6] italic">{quote.text}</p>
          <p className="mt-3 text-[9px] uppercase tracking-[0.28em] text-[var(--ink-muted)] font-medium">
            — {quote.author}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MemoriesSection({
  eyebrow,
  quotes,
  slides,
}: {
  eyebrow: string;
  quotes: Array<{ text: string; author: string }>;
  slides: Array<{ type: "image"; src?: string; alt: string } | { type: "quote" }>;
}) {
  const [index, setIndex] = useState(0);
  const [slideStep, setSlideStep] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);
  const safeSlides = slides.length ? slides : fallbackMemorySlides;
  const maxIndex = safeSlides.length - 1;

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex((i) => Math.min(maxIndex, i + 1)), [maxIndex]);

  useEffect(() => {
    const measure = () => {
      if (!slideRef.current) return;
      const gap = window.innerWidth >= 1024 ? 20 : 16;
      setSlideStep(slideRef.current.offsetWidth + gap);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const renderSlide = (slide: (typeof safeSlides)[number], i: number) =>
    slide.type === "image" ? (
      <div
        key={i}
        className="group overflow-hidden rounded-md aspect-[4/5] shadow-[0_8px_30px_-12px_rgba(43,33,24,0.2)]"
      >
        {slide.src ? (
        <img
          src={slide.src}
          alt={slide.alt}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-[1.3s] ease-out group-hover:scale-[1.04]"
        />
        ) : null}
      </div>
    ) : (
      <QuoteCard key={i} quotes={quotes} />
    );

  const arrowBtn =
    "absolute top-1/2 z-10 -translate-y-1/2 rounded-full border border-[var(--border)] bg-[var(--cream)]/95 flex items-center justify-center text-[var(--ink-muted)] hover:border-[var(--cocoa)] hover:text-[var(--cocoa)] hover:shadow-[0_4px_16px_-6px_rgba(43,33,24,0.18)] transition-all duration-300 disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none touch-manipulation";

  return (
    <section className="bg-[var(--cream)] py-14 sm:py-20 lg:py-28">
      <SectionEyebrow>{eyebrow}</SectionEyebrow>

      <div className="relative mx-auto mt-10 sm:mt-12 lg:mt-12 max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={prev}
          disabled={index === 0}
          aria-label="Previous memory"
          className={`${arrowBtn} left-0 sm:left-1 lg:left-2 w-9 h-9 lg:w-12 lg:h-12`}
        >
          <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
        </button>

        <button
          type="button"
          onClick={next}
          disabled={index === maxIndex}
          aria-label="Next memory"
          className={`${arrowBtn} right-0 sm:right-1 lg:right-2 w-9 h-9 lg:w-12 lg:h-12`}
        >
          <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" strokeWidth={1.5} />
        </button>

        <div className="overflow-hidden px-11 sm:px-12 lg:px-16 touch-pan-x">
          <motion.div
            className="flex gap-4 lg:gap-5"
            animate={{ x: slideStep ? -index * slideStep : 0 }}
            transition={{ duration: 0.65, ease }}
          >
            {safeSlides.map((slide, i) => (
              <div
                key={i}
                ref={i === 0 ? slideRef : undefined}
                className="shrink-0 w-[min(170px,62vw)] sm:w-[190px] lg:w-[210px] xl:w-[230px]"
              >
                {renderSlide(slide, i)}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

const botanicalMask: React.CSSProperties = {
  maskImage:
    "radial-gradient(circle at center, rgba(0,0,0,1) 55%, rgba(0,0,0,0.35) 80%, rgba(0,0,0,0) 100%)",
  WebkitMaskImage:
    "radial-gradient(circle at center, rgba(0,0,0,1) 55%, rgba(0,0,0,0.35) 80%, rgba(0,0,0,0) 100%)",
};

function PalmLeafTopRight({ src }: { src?: string }) {
  return (
    <div
      className="absolute z-0 pointer-events-none bottom-0 right-0 w-[min(380px,42vw)] translate-x-[14%] translate-y-[10%]"
      style={botanicalMask}
      aria-hidden
    >
      {src ? (
      <img
        src={src}
        alt=""
        className="w-full h-auto mix-blend-screen opacity-[0.42]"
      />
      ) : null}
    </div>
  );
}

function MonsteraPalmBottomLeft({ src }: { src?: string }) {
  return (
    <div
      className="absolute z-0 pointer-events-none bottom-0 left-0 w-[min(300px,34vw)] max-h-[82%] -translate-x-[10%] translate-y-[14%]"
      style={botanicalMask}
      aria-hidden
    >
      {src ? (
      <img
        src={src}
        alt=""
        className="w-full h-full object-contain object-left-bottom mix-blend-screen opacity-[0.42]"
      />
      ) : null}
    </div>
  );
}

function BotanicalDecor({ variant, src }: { variant: "level4" | "level5"; src?: string }) {
  return variant === "level4" ? <PalmLeafTopRight src={src} /> : <MonsteraPalmBottomLeft src={src} />;
}

function ExperienceRow({
  level,
  title,
  description,
  image,
  imageAlt,
  to,
  cta,
  imageSide,
  decorVariant,
  decorSrc,
}: {
  level: string;
  title: React.ReactNode;
  description: string;
  image?: string;
  imageAlt: string;
  to: "/level-4-dining" | "/level-5-events";
  cta: string;
  imageSide: "left" | "right";
  decorVariant: "level4" | "level5";
  decorSrc?: string;
}) {
  const isLevel5 = decorVariant === "level5";

  const textPanel = (
    <div
      className={`relative flex flex-col bg-[var(--cream-warm)] px-8 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-10 min-h-[220px] sm:min-h-[260px] lg:min-h-[300px] lg:h-full overflow-hidden ${
        isLevel5 ? "lg:justify-start lg:pt-[10%]" : "justify-center"
      }`}
    >
      <BotanicalDecor variant={decorVariant} src={decorSrc} />
      <div
        className={`relative z-[2] ${
          isLevel5 ? "lg:ml-auto lg:w-[54%] lg:max-w-[340px] lg:mr-[6%]" : ""
        }`}
      >
        <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--gold)] font-medium">
          {level}
        </p>
        <h3 className="heading-section mt-3 text-[clamp(1.75rem,3.2vw,2.5rem)] text-[var(--ink)] leading-[1.1]">
          {title}
        </h3>
        <p className="mt-4 text-[14px] text-[var(--ink-muted)] leading-[1.85] max-w-[320px]">
          {description}
        </p>
        <Link
          to={to}
          className="mt-6 inline-flex items-center gap-2 w-fit border border-[var(--cocoa)] text-[var(--cocoa)] text-[10px] uppercase tracking-[0.26em] font-semibold px-6 py-3 hover:bg-[var(--cocoa)] hover:text-white transition-colors duration-300 group/btn touch-manipulation"
        >
          {cta}
          <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );

  const imagePanel = (
    <div className="relative h-[220px] sm:h-[260px] lg:h-full lg:min-h-[300px] overflow-hidden group">
      {image ? (
      <img
        src={image}
        alt={imageAlt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.03]"
      />
      ) : null}
    </div>
  );

  return (
    <Reveal>
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
        {imageSide === "left" ? (
          <>
            {imagePanel}
            {textPanel}
          </>
        ) : (
          <>
            {textPanel}
            {imagePanel}
          </>
        )}
      </div>
    </Reveal>
  );
}

function ChooseExperienceSection({
  eyebrow,
  level4,
  level5,
}: {
  eyebrow: string;
  level4: {
    level: string;
    titleLines: string[];
    description: string;
    image?: string;
    imageAlt: string;
    to: "/level-4-dining" | "/level-5-events";
    cta: string;
    decor?: string;
  };
  level5: {
    level: string;
    titleLines: string[];
    description: string;
    image?: string;
    imageAlt: string;
    to: "/level-4-dining" | "/level-5-events";
    cta: string;
    decor?: string;
  };
}) {
  return (
    <section className="bg-[var(--cream)] pb-14 sm:pb-20 lg:pb-28">
      <SectionEyebrow>{eyebrow}</SectionEyebrow>

      <div className="mx-auto mt-10 sm:mt-12 max-w-[1400px] px-4 sm:px-6 lg:px-10 flex flex-col">
        <ExperienceRow
          level={level4.level}
          title={
            <>
              {level4.titleLines[0]}
              <br />
              {level4.titleLines[1] || ""}
            </>
          }
          description={level4.description}
          image={level4.image}
          imageAlt={level4.imageAlt}
          to={level4.to}
          cta={level4.cta}
          imageSide="left"
          decorVariant="level4"
          decorSrc={level4.decor}
        />
        <ExperienceRow
          level={level5.level}
          title={
            <>
              {level5.titleLines[0]}
              <br />
              {level5.titleLines[1] || ""}
            </>
          }
          description={level5.description}
          image={level5.image}
          imageAlt={level5.imageAlt}
          to={level5.to}
          cta={level5.cta}
          imageSide="right"
          decorVariant="level5"
          decorSrc={level5.decor}
        />
      </div>
    </section>
  );
}

function ForeverWordmark({
  className = "",
  size = "5.5rem",
  text = "forever.",
}: {
  className?: string;
  size?: string;
  text?: string;
}) {
  return (
    <p
      className={`relative select-none ${className}`}
      style={{
        fontFamily: '"Allura", "Pinyon Script", cursive',
        fontSize: size,
        lineHeight: 1,
        color: "var(--cocoa)",
      }}
    >
      {text}
      <motion.span
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.8, ease }}
        className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[var(--gold)] origin-left rounded-full"
      />
    </p>
  );
}

function PhilosophySection({
  headline,
  body,
  highlight,
  wordmark,
  pillars,
}: {
  headline: string;
  body: string;
  highlight: string;
  wordmark: string;
  pillars: Array<{ Icon: LucideIcon; label: string; customIconUrl?: string }>;
}) {
  return (
    <section className="bg-[var(--cream-warm)] py-14 sm:py-20 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,240px)_1fr_auto] gap-10 sm:gap-12 lg:gap-16 items-center">
          <Reveal>
            <p
              className="heading-section text-[var(--cocoa)] text-[clamp(2rem,6vw,2.5rem)] leading-[1.15]"
            >
              {headline}
            </p>
            <p className="mt-5 text-[var(--ink-muted)] text-[14px] leading-[1.95] max-w-none lg:max-w-[230px]">
              {body}{" "}
              <span className="text-[var(--ink)] font-medium">
                {highlight}
              </span>
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 text-center">
              {pillars.map(({ Icon, label, customIconUrl }) => (
                <motion.div
                  key={label}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3, ease }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--cocoa)] shrink-0 bg-[var(--cream)]/50 overflow-hidden">
                    {customIconUrl ? (
                      <img src={customIconUrl} alt="" className="w-5 h-5 object-contain" />
                    ) : (
                      <Icon size={19} strokeWidth={1.25} />
                    )}
                  </div>
                  <p className="text-[10.5px] uppercase tracking-[0.22em] text-[var(--ink)] font-medium leading-[1.65] whitespace-pre-line">
                    {label}
                  </p>
                </motion.div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.2} className="flex lg:hidden justify-center mt-2 sm:mt-4">
            <ForeverWordmark size="4rem" text={wordmark} />
          </Reveal>

          <Reveal delay={0.2} className="hidden lg:flex flex-col items-end">
            <ForeverWordmark text={wordmark} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
