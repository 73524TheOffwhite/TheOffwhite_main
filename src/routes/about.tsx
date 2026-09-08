import { useEffect, useState, type CSSProperties } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";
import { Testimonials } from "@/components/sections/Testimonials";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import arch from "@/assets/story-arch.jpg";
import philosophyDining from "@/assets/philosophy-dining.jpg";
import philosophyChef from "@/assets/philosophy-chef-santosh.jpg";
import kitchenBar from "@/assets/kitchen-bar-level4.jpg";
import kitchenBartender from "@/assets/kitchen-bartender.jpg";
import {
  founderProfiles,
  founderSocialHandles,
  founderStoryClosing,
  founderStoryIntro,
  sharedValuesStory,
} from "@/data/founder-story";
import { useAboutCms } from "@/lib/about-cms";
import { cmsSrc } from "@/lib/cms-src";
import { cn } from "@/lib/utils";

const fallbackPhilosophyImages = [
  { src: philosophyChef, alt: "Head Chef Santosh at The Off White" },
  { src: philosophyDining, alt: "Level 5 dining room" },
];

const fallbackKitchenImages = [
  { src: kitchenBar, alt: "Level 4 bar at The Off White" },
  { src: kitchenBartender, alt: "Bartender crafting cocktails at The Off White" },
];

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — The Off White" },
      { name: "description", content: "The story, philosophy and people behind The Off White Bar & Grill in Navelim, South Goa." },
      { property: "og:title", content: "About — The Off White" },
      { property: "og:description", content: "Where architecture meets cuisine. Our story." },
    ],
  }),
  component: AboutPage,
});

const fallbackValues = [
  { num: "01", title: "Mediterranean Soul", body: "Sun-soaked flavours, slow afternoons, generous hospitality. Every plate carries a memory of the sea." },
  { num: "02", title: "Crafted by Hand", body: "From the breads we bake at dawn to the cocktails stirred at dusk — every detail is made, not assembled." },
  { num: "03", title: "Architecture of Calm", body: "Arches, lime-washed walls, warm light. The room is the first course." },
];

const fallbackStats = [
  { v: "12+", l: "Years of craft" },
  { v: "08", l: "Signature dishes" },
  { v: "100%", l: "Made in-house" },
  { v: "4.9", l: "Guest rating" },
];

function ImageFade({
  images,
  isPending = false,
}: {
  images: Array<{ src: string; alt: string }>;
  isPending?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const safeImages = isPending ? [] : images.length ? images : fallbackPhilosophyImages;

  useEffect(() => {
    if (safeImages.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % safeImages.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [safeImages.length]);

  const current = safeImages.length ? safeImages[index % safeImages.length] : undefined;

  return (
    <div className="relative overflow-hidden arch-top shadow-[0_30px_80px_-30px_rgba(43,33,24,0.35)] h-[420px] lg:h-[580px]">
      {current ? (
      <AnimatePresence mode="sync">
        <motion.img
          key={`${current.src}-${index}`}
          src={current.src}
          alt={current.alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      ) : null}
    </div>
  );
}

function KitchenImageFade({
  images,
  isPending = false,
}: {
  images: Array<{ src: string; alt: string }>;
  isPending?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const safeImages = isPending ? [] : images.length ? images : fallbackKitchenImages;

  useEffect(() => {
    if (safeImages.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % safeImages.length);
    }, 3000);
    return () => window.clearInterval(id);
  }, [safeImages.length]);

  const current = safeImages.length ? safeImages[index % safeImages.length] : undefined;

  return (
    <div className="relative overflow-hidden arch-top shadow-[0_30px_80px_-30px_rgba(43,33,24,0.35)] h-[420px] lg:h-[560px]">
      {current ? (
      <AnimatePresence mode="sync">
        <motion.img
          key={`${current.src}-${index}`}
          src={current.src}
          alt={current.alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      ) : null}
    </div>
  );
}

const FOUNDER_PREVIEW_CHARS = 320;

type FounderCardData = {
  name: string;
  role: string;
  paragraphs: string[];
  imageUrl?: string;
  mobileObjectPosition?: string;
  desktopObjectPosition?: string;
};

function FounderProfileCard({
  profile,
  index,
}: {
  profile: FounderCardData;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const fullText = profile.paragraphs.join("\n\n");
  const needsTruncate = fullText.length > FOUNDER_PREVIEW_CHARS;
  const previewText = needsTruncate
    ? `${fullText.slice(0, FOUNDER_PREVIEW_CHARS).trimEnd()}…`
    : fullText;
  const initials = profile.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <article className="flex h-full min-h-[300px] flex-col overflow-hidden rounded-md border border-[var(--border)]/70 bg-[var(--cream)] sm:min-h-[280px] sm:flex-row">
      <div className="flex min-w-0 flex-1 flex-col px-5 py-6 sm:px-7 sm:py-7 lg:px-8 lg:py-8">
        <span className="font-serif italic text-[1.65rem] leading-none text-[var(--gold)] sm:text-[1.85rem]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="mt-2.5 h-px w-9 bg-[var(--gold)]/55" />
        <h3 className="heading-section mt-4 text-[clamp(1.45rem,2.4vw,1.95rem)] leading-[1.15] text-[var(--ink)]">
          {profile.name}
        </h3>
        <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.24em] text-[var(--cocoa)] sm:text-[10px]">
          {profile.role}
        </p>

        <div
          className={cn(
            "mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 [scrollbar-width:thin]",
            !expanded && "max-h-[7.5rem] sm:max-h-[8.5rem]",
            expanded && "max-h-[11rem] sm:max-h-[12rem]",
          )}
        >
          {expanded ? (
            profile.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 48)}
                className="mt-3 first:mt-0 text-[13px] leading-[1.75] text-[var(--ink-muted)] sm:text-[14px] sm:leading-[1.8]"
              >
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-[13px] leading-[1.75] text-[var(--ink-muted)] sm:text-[14px] sm:leading-[1.8]">
              {previewText}
            </p>
          )}
        </div>

        {needsTruncate ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 self-start text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--cocoa)] transition-colors hover:text-[var(--gold)]"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}
      </div>

      <div className="relative order-first aspect-[4/5] max-h-[320px] w-full shrink-0 p-3 sm:order-none sm:aspect-auto sm:max-h-none sm:h-auto sm:w-[38%] sm:self-stretch sm:p-4 lg:w-[34%]">
        <div className="relative h-full min-h-0 overflow-hidden rounded-xl bg-[var(--cream-warm)]">
          {profile.imageUrl ? (
            <img
              src={profile.imageUrl}
              alt={profile.name}
              decoding="async"
              className="founder-card-photo absolute inset-0 h-full w-full max-w-none object-cover"
              style={
                {
                  "--founder-mobile-pos": profile.mobileObjectPosition ?? "center 12%",
                  "--founder-desktop-pos": profile.desktopObjectPosition ?? "center",
                } as CSSProperties
              }
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
              <span className="font-serif text-3xl tracking-[0.08em] text-[var(--gold)]/45 sm:text-4xl">
                {initials}
              </span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function FounderStorySection({
  eyebrow,
  headline,
  intro,
  cards,
  valuesEyebrow,
  valuesParagraphs,
  closingLines,
  socialHandles,
}: {
  eyebrow: string;
  headline: string;
  intro: string[];
  cards: FounderCardData[];
  valuesEyebrow: string;
  valuesParagraphs: string[];
  closingLines: string[];
  socialHandles: string[];
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setCurrent(api.selectedScrollSnap());
      setCanScrollNext(api.canScrollNext());
    };
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <section className="bg-[var(--cream-warm)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1120px] px-6 lg:px-10">
        <Reveal className="text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="heading-section mt-5 text-[clamp(2rem,3.6vw,3.2rem)] leading-[1.1] text-[var(--ink)]">
            {headline}
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-10 max-w-[860px]">
          {intro.map((paragraph) => (
            <p key={paragraph} className="mt-5 text-[15px] leading-[1.95] text-[var(--ink-muted)]">
              {paragraph}
            </p>
          ))}
        </Reveal>

        <Reveal delay={0.15} className="mt-14">
          <div className="relative">
            <Carousel setApi={setApi} opts={{ align: "start", loop: false }} className="w-full">
              <CarouselContent className="-ml-3 md:-ml-5">
                {cards.map((profile, index) => (
                  <CarouselItem
                    key={profile.name}
                    className="pl-3 md:pl-5 basis-[92%] sm:basis-[78%] md:basis-[68%] lg:basis-[62%]"
                  >
                    <FounderProfileCard profile={profile} index={index} />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            <button
              type="button"
              aria-label="Swipe to next profile"
              disabled={!canScrollNext}
              onClick={() => api?.scrollNext()}
              className={cn(
                "group absolute right-0 top-8 z-10 sm:right-2 md:right-3",
                "flex items-center gap-2 rounded-full border border-[var(--ink)]/10 bg-[var(--cream)]/75",
                "px-3.5 py-2 backdrop-blur-[2px] transition-all duration-500",
                "opacity-45 hover:opacity-85 hover:border-[var(--gold)]/35 hover:bg-[var(--cream)]/95",
                "disabled:pointer-events-none disabled:opacity-0",
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--ink)]">
                Swipe
              </span>
              <span
                aria-hidden
                className="font-serif text-lg leading-none text-[var(--gold)] transition-transform duration-500 group-hover:translate-x-0.5"
              >
                →
              </span>
            </button>
          </div>

          <div className="mt-7 flex items-center justify-center gap-2" role="tablist" aria-label="Founder profiles">
            {cards.map((profile, i) => (
              <button
                key={profile.name}
                type="button"
                role="tab"
                aria-selected={current === i}
                aria-label={`Show ${profile.name}`}
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  "rounded-full transition-all duration-300",
                  current === i
                    ? "h-2 w-2 bg-[var(--cocoa)]"
                    : "h-2 w-2 bg-[var(--ink)]/18 hover:bg-[var(--ink)]/35",
                )}
              />
            ))}
          </div>
        </Reveal>

        <Reveal className="mx-auto mt-16 max-w-[900px] text-center">
          <Eyebrow>{valuesEyebrow}</Eyebrow>
          <div className="mt-8">
            {valuesParagraphs.map((paragraph) => (
              <p key={paragraph} className="mt-5 text-[15px] leading-[1.95] text-[var(--ink-muted)]">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mx-auto mt-12 h-px w-16 bg-[var(--gold)]/60" />
          {closingLines.map((paragraph, index) => (
            <p
              key={paragraph}
              className={
                index === 0
                  ? "mt-10 font-serif text-2xl text-[var(--ink)]"
                  : "mt-4 text-[15px] leading-[1.9] text-[var(--ink-muted)]"
              }
            >
              {paragraph}
            </p>
          ))}
          <p className="mt-8 text-sm tracking-[0.12em] text-[var(--cocoa)]">
            {socialHandles.join(" · ")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function headlineNodes(headline: string, fallbackLines: string[]) {
  if (headline.includes("\n")) return headline.split("\n");
  if (headline.includes(" / ")) return headline.split(/\s*\/\s*/).map((p) => p.trim()).filter(Boolean);
  if (/coast remembers it/i.test(headline)) return ["Cooking the way the", "coast remembers it."];
  if (/quiet devotion/i.test(headline) && /to detail/i.test(headline)) return ["A Quiet Devotion", "to Detail"];
  if (/attention/i.test(headline) && /generously/i.test(headline)) {
    return ['"A great meal is just attention,', 'given generously."'];
  }
  return fallbackLines.length ? fallbackLines : [headline];
}

function AboutPage() {
  const { data, isPending } = useAboutCms();

  const heroEyebrow = data?.hero.eyebrow || "Our Story";
  const heroHeadline = data?.hero.headline || "A Quiet Devotion / to Detail";
  const heroDescription =
    data?.hero.description ||
    "The Off White began as a shared dream shaped by global hospitality, culinary craft and Goan warmth. Today, it is a destination in the heart of Navelim, South Goa.";
  const heroImage = cmsSrc(isPending, data?.hero.imageUrl, arch);
  const heroCrumb = data?.hero.breadcrumb || "About";
  const heroTitleLines = headlineNodes(heroHeadline, ["A Quiet Devotion", "to Detail"]);

  const philosophyEyebrow = data?.philosophy.eyebrow || "Our Philosophy";
  const philosophyHeadline = data?.philosophy.headline || "Cooking the way the coast remembers it.";
  const philosophyLines = headlineNodes(philosophyHeadline, ["Cooking the way the", "coast remembers it."]);
  const philosophyBody1 =
    data?.philosophy.body1 ||
    "We source quietly — small fishermen at first light, herbs from gardens we know by name, olive oil from a single grove on the Aegean. Nothing arrives in a box. Everything arrives with a story.";
  const philosophyBody2 =
    data?.philosophy.body2 ||
    "The kitchen is led by a small team who believe that restraint is the highest form of generosity. We season with intent. We plate with patience. We let the produce speak.";
  const philosophyImages =
    data?.philosophy.slides?.length
      ? data.philosophy.slides.map((slide, i) => ({
          src: slide.imageUrl || fallbackPhilosophyImages[i % fallbackPhilosophyImages.length].src,
          alt: slide.alt || fallbackPhilosophyImages[i % fallbackPhilosophyImages.length].alt,
        }))
      : fallbackPhilosophyImages;

  const foundersEyebrow = data?.founders.eyebrow || "Vision, Partnership & Excellence";
  const foundersHeadline = data?.founders.headline || "The Off White Bar & Grill Story";
  const foundersIntro = data?.founders.intro?.length ? data.founders.intro : founderStoryIntro;
  const foundersCards =
    data?.founders.cards?.length
      ? data.founders.cards.map((card) => {
          const fallback = founderProfiles.find((p) => p.name === card.name);
          // Prefer bundled local assets so CMS/media transforms cannot replace
          // high-resolution portraits with lower-quality remote URLs.
          return {
            name: card.name,
            role: card.role,
            paragraphs: card.paragraphs,
            imageUrl: fallback?.imageUrl || card.imageUrl,
            mobileObjectPosition: fallback?.mobileObjectPosition,
            desktopObjectPosition: fallback?.desktopObjectPosition,
          };
        })
      : founderProfiles;
  const foundersValuesEyebrow = data?.founders.valuesEyebrow || "A Partnership Built on Shared Values";
  const foundersValuesParagraphs = data?.founders.valuesParagraphs?.length
    ? data.founders.valuesParagraphs
    : sharedValuesStory;
  const foundersClosing = data?.founders.closingLines?.length
    ? data.founders.closingLines
    : founderStoryClosing;
  const foundersSocial = data?.founders.socialHandles?.length
    ? data.founders.socialHandles
    : founderSocialHandles;

  const valuesEyebrow = data?.values.eyebrow || "What We Stand For";
  const valuesHeadline = data?.values.headline || "Three quiet principles";
  const values =
    data?.values.cards?.length
      ? data.values.cards.map((card, i) => ({
          num: String(i + 1).padStart(2, "0"),
          title: card.title,
          body: card.body,
        }))
      : fallbackValues;

  const stats =
    data?.stats?.length
      ? data.stats.map((stat) => ({ v: stat.value, l: stat.label }))
      : fallbackStats;

  const kitchenEyebrow = data?.kitchen.eyebrow || "From the Kitchen";
  const kitchenHeadline =
    data?.kitchen.headline || '"A great meal is just attention, given generously."';
  const kitchenLines = headlineNodes(kitchenHeadline, [
    '"A great meal is just attention,',
    'given generously."',
  ]);
  const kitchenBody =
    data?.kitchen.body ||
    "Our kitchen is small by design. It lets us listen — to the produce, to the season, to the table. If you ever wonder who is cooking your dinner, please, ask. We'd love to come say hello.";
  const kitchenAttribution = data?.kitchen.attribution || "— The Off White Kitchen";
  const kitchenButton = data?.kitchen.button || { label: "See What's Cooking", href: "/menu" };
  const kitchenImages =
    data?.kitchen.slides?.length
      ? data.kitchen.slides.map((slide, i) => ({
          src: slide.imageUrl || fallbackKitchenImages[i % fallbackKitchenImages.length].src,
          alt: slide.alt || fallbackKitchenImages[i % fallbackKitchenImages.length].alt,
        }))
      : fallbackKitchenImages;

  return (
    <>
      <PageHero
        eyebrow={heroEyebrow}
        title={
          <>
            {heroTitleLines.map((line, i) => (
              <span key={`${line}-${i}`}>
                {i > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </>
        }
        description={heroDescription}
        image={heroImage}
        crumb={heroCrumb}
      />

      {/* Philosophy */}
      <section className="bg-[var(--cream)] py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-14 px-6 lg:grid-cols-2 lg:gap-20 lg:px-10 items-center">
          <Reveal>
            <ImageFade images={philosophyImages} isPending={isPending} />
          </Reveal>
          <Reveal delay={0.15}>
            <Eyebrow>{philosophyEyebrow}</Eyebrow>
            <h2 className="heading-section mt-5 text-[clamp(2rem,3.6vw,3.2rem)] leading-[1.1] text-[var(--ink)]">
              {philosophyLines.map((line, i) => (
                <span key={`${line}-${i}`}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </h2>
            <p className="mt-7 text-[var(--ink-muted)] leading-[1.9] max-w-lg">{philosophyBody1}</p>
            <p className="mt-5 text-[var(--ink-muted)] leading-[1.9] max-w-lg">{philosophyBody2}</p>
          </Reveal>
        </div>
      </section>

      <FounderStorySection
        eyebrow={foundersEyebrow}
        headline={foundersHeadline}
        intro={foundersIntro}
        cards={foundersCards}
        valuesEyebrow={foundersValuesEyebrow}
        valuesParagraphs={foundersValuesParagraphs}
        closingLines={foundersClosing}
        socialHandles={foundersSocial}
      />

      {/* Values */}
      <section className="bg-[var(--cream-warm)] py-24 lg:py-32">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <Reveal className="text-center">
            <Eyebrow>{valuesEyebrow}</Eyebrow>
            <h2 className="heading-section mt-4 text-[clamp(2rem,3.6vw,3.2rem)] text-[var(--ink)]">{valuesHeadline}</h2>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {values.map((v, i) => (
              <Reveal key={v.num + v.title} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full bg-[var(--cream)] p-10 rounded-sm border border-[var(--border)]/60"
                >
                  <span className="font-serif italic text-4xl text-[var(--gold)]">{v.num}</span>
                  <div className="mt-4 h-px w-10 bg-[var(--gold)]/60" />
                  <h3 className="mt-6 text-2xl text-[var(--ink)]">{v.title}</h3>
                  <p className="mt-4 text-[var(--ink-muted)] leading-[1.85] text-[15px]">{v.body}</p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-[var(--cream)] py-20 lg:py-24">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6 text-center">
            {stats.map((s, i) => (
              <Reveal key={s.l} delay={i * 0.08}>
                <div>
                  <div className="font-serif text-5xl lg:text-6xl text-[var(--cocoa)]">{s.v}</div>
                  <div className="mt-3 h-px w-8 mx-auto bg-[var(--gold)]/60" />
                  <p className="mt-3 text-[11px] uppercase tracking-[0.28em] text-[var(--ink-muted)]">{s.l}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Chef cue */}
      <section className="relative bg-[var(--cream-warm)] py-24 lg:py-32 overflow-hidden">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-20 px-6 lg:px-10 items-center">
          <Reveal delay={0.1}>
            <Eyebrow>{kitchenEyebrow}</Eyebrow>
            <h2 className="heading-section mt-5 text-[clamp(2rem,3.6vw,3rem)] text-[var(--ink)] leading-[1.15]">
              {kitchenLines.map((line, i) => (
                <span key={`${line}-${i}`}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </h2>
            <p className="mt-7 text-[var(--ink-muted)] leading-[1.9] max-w-lg">{kitchenBody}</p>
            <p className="mt-8 text-sm text-[var(--ink)]">{kitchenAttribution}</p>
            <Link to={kitchenButton.href.startsWith("/") ? kitchenButton.href : "/menu"} className="btn-outline mt-10">
              {kitchenButton.label}
            </Link>
          </Reveal>
          <Reveal>
            <KitchenImageFade images={kitchenImages} isPending={isPending} />
          </Reveal>
        </div>
      </section>

      <Testimonials />
    </>
  );
}
