import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { level5Description } from "@/data/levels";
import { useLevel5Cms } from "@/lib/level5-cms";
import { cmsSrc } from "@/lib/cms-src";
import { useSiteSettings } from "@/lib/site-settings";

import spaceLevel5Dining from "@/assets/space-level5-dining.jpg";
import spaceLevel5Interior from "@/assets/space-level5-interior.jpg";
import spaceLevel5 from "@/assets/space-level5.jpg";
import philosophyDining from "@/assets/philosophy-dining.jpg";
import spaceGridDining from "@/assets/space-grid-dining.jpg";
import spaceGridCorridor from "@/assets/space-grid-corridor.jpg";
import spaceGridPendants from "@/assets/space-grid-pendants.jpg";
import kitchenBarLevel4 from "@/assets/kitchen-bar-level4.jpg";
import spaceBrand from "@/assets/space-brand.jpg";
import spaceHero from "@/assets/space-hero.jpg";

export const Route = createFileRoute("/level-5-events")({
  head: () => ({
    meta: [
      { title: "Level 5 — Events & Parties | The Off White" },
      { name: "description", content: "Grand. Airy. Unforgettable. Level 5 at The Off White transforms for galas, weddings, private dinners and celebrations." },
      { property: "og:title", content: "Level 5 — Events & Parties" },
      { property: "og:description", content: "Grand. Airy. Unforgettable." },
    ],
  }),
  component: Level5Page,
});

const ease = [0.22, 1, 0.36, 1] as const;

const defaultOccasions = [
  { label: "Corporate\nDinners",    img: spaceLevel5Dining },
  { label: "Private\nCelebrations", img: philosophyDining },
  { label: "Engagement\nParties",   img: spaceLevel5 },
  { label: "Birthdays",             img: spaceGridDining },
  { label: "Brand\nLaunches",       img: spaceLevel5Interior },
];

const defaultGalleryWalk = [
  { label: "The Lounge",     img: spaceLevel5 },
  { label: "The Bar",        img: kitchenBarLevel4 },
  { label: "Window Seating", img: spaceGridCorridor },
  { label: "The Decor Wall", img: spaceBrand },
  { label: "Open Dining",    img: spaceGridPendants },
];

function linesFromSlash(text: string) {
  return text.split("/").map((part) => part.trim()).filter(Boolean);
}

/* ─── Inline SVG icons ─── */
function IconGuests() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="23" cy="14" r="5.5" />
      <path d="M9 41 Q9 29 23 29 Q37 29 37 41" />
      <circle cx="9" cy="17" r="4" />
      <path d="M1 38 Q1 29 9 29" />
      <circle cx="37" cy="17" r="4" />
      <path d="M45 38 Q45 29 37 29" />
    </svg>
  );
}

function IconArch() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 42 L7 24 Q7 8 23 8 Q39 8 39 24 L39 42" />
      <path d="M3 42 L43 42" />
      <path d="M14 42 L14 26 Q14 17 23 17 Q32 17 32 26 L32 42" />
    </svg>
  );
}

function IconSun() {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <circle cx="23" cy="23" r="7" />
      <line x1="23" y1="5"  x2="23" y2="10" />
      <line x1="23" y1="36" x2="23" y2="41" />
      <line x1="5"  y1="23" x2="10" y2="23" />
      <line x1="36" y1="23" x2="41" y2="23" />
      <line x1="11.2" y1="11.2" x2="14.7" y2="14.7" />
      <line x1="31.3" y1="31.3" x2="34.8" y2="34.8" />
      <line x1="34.8" y1="11.2" x2="31.3" y2="14.7" />
      <line x1="14.7" y1="31.3" x2="11.2" y2="34.8" />
    </svg>
  );
}

function HeartOutline({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`inline-block align-middle ${className}`}
      width="17"
      height="15"
      viewBox="0 0 17 15"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 13.5 C8.5 13.5 1 8.5 1 4.2 A3.8 3.8 0 0 1 8.5 2.8 A3.8 3.8 0 0 1 16 4.2 C16 8.5 8.5 13.5 8.5 13.5Z" />
    </svg>
  );
}

function WavyLine({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="72"
      height="12"
      viewBox="0 0 72 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    >
      <path d="M0 6 Q9 1 18 6 T36 6 T54 6 T72 6" />
    </svg>
  );
}

/* ─── Booking card ─── */
function BookingCard() {
  const { data: cms } = useLevel5Cms();
  const settings = useSiteSettings();
  const [name, setName] = useState("");
  const [eventName, setEventName] = useState("");
  const cardTitle = cms?.goldenHour.cardTitle || "Plan Your Celebration";
  const nameLabel = cms?.goldenHour.nameLabel || "Name";
  const eventNameLabel = cms?.goldenHour.eventNameLabel || "Event Name";
  const buttonLabel = cms?.goldenHour.button.label || "Enquire Now";
  const footerScript = cms?.goldenHour.footerScript || "We can't wait to host you!";

  const continueEnquiry = () => {
    const event = eventName.trim() || "my event";
    const message = `Hi! I’d like to reserve a table at Off White for ${event}. Could you please help me with the reservation?`;
    const whatsappUrl =
      "https://wa.me/" +
      settings.whatsapp_number +
      "?text=" +
      encodeURIComponent(message);
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const fieldLabel = "block text-[8.5px] uppercase tracking-[0.25em] font-semibold text-[var(--ink-muted)] mb-1.5";
  const inputBase =
    "w-full bg-white border border-[var(--border)] px-3 py-2.5 text-[12.5px] text-[var(--ink)] placeholder:text-[var(--ink-muted)]/70 outline-none focus:border-[var(--cocoa)] transition-colors duration-200 rounded-sm";

  return (
    <div className="bg-[var(--cream)] rounded-2xl px-7 sm:px-8 py-8 shadow-[0_32px_80px_-16px_rgba(0,0,0,0.45)]">
      <p className="text-[9px] uppercase tracking-[0.34em] font-semibold text-[var(--ink-muted)]">
        {cardTitle}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className={fieldLabel} htmlFor="level5-name">
            {nameLabel}
          </label>
          <input
            id="level5-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            autoComplete="name"
            className={inputBase}
          />
        </div>
        <div>
          <label className={fieldLabel} htmlFor="level5-event-name">
            {eventNameLabel}
          </label>
          <input
            id="level5-event-name"
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="e.g. Birthday dinner"
            className={inputBase}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={continueEnquiry}
        className="mt-5 w-full bg-[var(--cocoa)] hover:bg-[var(--cocoa-dark)] text-[var(--cream)] text-[10px] uppercase tracking-[0.32em] font-semibold py-3.5 transition-colors duration-300 rounded-sm active:translate-y-px"
      >
        {buttonLabel}
      </button>

      <p
        className="mt-4 text-center text-[1.15rem] text-[var(--cocoa)]"
        style={{ fontFamily: "Allura, cursive" }}
      >
        {footerScript}
      </p>
    </div>
  );
}

/* ─── Page ─── */
function Level5Page() {
  return (
    <div className="overflow-x-hidden bg-[var(--cream)]">
      <HeroSection />
      <FeaturesSection />
      <Level5Story />
      <OccasionsSection />
      <NoteAndGallerySection />
      <GoldenHourSection />
    </div>
  );
}

/* ─── Level 5 story ─── */
function Level5Story() {
  const { data: cms } = useLevel5Cms();
  const eyebrow = cms?.story.eyebrow || level5Description.eyebrow;
  const title = cms?.story.title || level5Description.title;
  const intro = cms?.story.intro || level5Description.intro;
  const paragraphs =
    cms?.story.paragraphs?.length ? cms.story.paragraphs : level5Description.paragraphs;
  const features = cms?.story.pills?.length
    ? cms.story.pills.map((p) => p.label)
    : level5Description.features;
  const closing = cms?.story.closing || level5Description.closing;

  return (
    <section className="bg-[var(--cream)] px-6 sm:px-8 lg:px-12 pb-16 sm:pb-20 lg:pb-24">
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

        <Reveal delay={0.12}>
          <p className="mt-12 border-t border-[var(--ink)]/10 pt-8 font-serif text-[var(--ink)] leading-[1.6] text-[clamp(1.1rem,1.8vw,1.5rem)] max-w-[860px]">
            {closing}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ─── 1. HERO ─── */
function HeroSection() {
  const { data: cms, isPending } = useLevel5Cms();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const imageSrc = cmsSrc(isPending, cms?.hero.imageUrl, spaceLevel5Dining);
  const eyebrow = cms?.hero.eyebrow || "Level 5";
  const headlineLines = linesFromSlash(cms?.hero.headline || "Made for / beautiful / together.");
  const subline = cms?.hero.subline || "Celebrations. Gatherings. Milestones.";

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[640px] overflow-hidden">
      {/* Parallax background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 will-change-transform">
        {imageSrc ? (
        <motion.img
          src={imageSrc}
          alt="Level 5 — grand airy dining hall with arched windows and palms"
          className="w-full h-full object-cover"
          loading="eager"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.2, ease }}
        />
        ) : null}
        {/* Left-to-right gradient so text on left stays readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
        {/* Bottom-to-top gradient for smooth curve merge */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      </motion.div>

      {/* Copy — bottom-left */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-24 sm:pb-28 lg:pb-32 px-6 sm:px-10 lg:px-16 max-w-[1400px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="text-[10.5px] uppercase tracking-[0.36em] text-white/80 font-medium"
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.14, ease }}
          className="mt-3 heading-hero font-normal text-white leading-[1.04] max-w-[480px]"
          style={{ fontSize: "clamp(2.6rem, 6vw, 5.2rem)" }}
        >
          {headlineLines.map((line, i) => (
            <span key={`${line}-${i}`}>
              {i > 0 ? <br /> : null}
              {line}{" "}
              {i === headlineLines.length - 1 ? (
                <HeartOutline className="text-white/85 relative -top-1" />
              ) : null}
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.44, ease }}
          className="mt-5 text-[10px] sm:text-[11px] uppercase tracking-[0.32em] text-white/80 font-medium"
        >
          {subline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.62, ease }}
          className="mt-5"
        >
          <WavyLine className="text-white/65" />
        </motion.div>
      </div>

      {/* Arch curve into features section */}
      <div className="absolute -bottom-px left-0 right-0 pointer-events-none">
        <svg
          viewBox="0 0 1440 96"
          preserveAspectRatio="none"
          className="w-full"
          style={{ height: "clamp(56px, 7vw, 96px)" }}
        >
          <path
            d="M0,96 L0,72 Q360,0 720,52 Q1080,96 1440,60 L1440,96 Z"
            fill="var(--cream)"
          />
        </svg>
      </div>
    </section>
  );
}

/* ─── 2. FEATURES ─── */
const defaultFeatures = [
  {
    icon: "guests" as const,
    Icon: IconGuests,
    title: "100 Guests",
    body: "Host unforgettable celebrations with your favourite people.",
  },
  {
    icon: "arch" as const,
    Icon: IconArch,
    title: "Double Height Ceiling",
    body: "A grand setting that adds to every moment.",
  },
  {
    icon: "sun" as const,
    Icon: IconSun,
    title: "Natural Daylight",
    body: "Bright, airy and beautiful from morning to sunset.",
  },
];

function featureIcon(icon: "guests" | "arch" | "sun" | "custom", customIconUrl?: string) {
  if (icon === "custom" && customIconUrl) {
    return <img src={customIconUrl} alt="" className="h-[46px] w-[46px] object-contain" />;
  }
  if (icon === "arch") return <IconArch />;
  if (icon === "sun") return <IconSun />;
  return <IconGuests />;
}

function FeaturesSection() {
  const { data: cms } = useLevel5Cms();
  const features = cms?.features?.length
    ? cms.features.map((feature) => ({
        key: feature.id,
        title: feature.title,
        body: feature.body,
        node: featureIcon(feature.icon, feature.customIconUrl),
      }))
    : defaultFeatures.map((feature) => ({
        key: feature.title,
        title: feature.title,
        body: feature.body,
        node: <feature.Icon />,
      }));

  return (
    <section className="bg-[var(--cream)] pt-14 sm:pt-18 pb-16 sm:pb-20 lg:pb-24">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 lg:gap-12">
          {features.map(({ key, title, body, node }, i) => (
            <Reveal key={key} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={{ duration: 0.35, ease }}
                className="flex flex-col items-center text-center"
              >
                <div className="text-[var(--cocoa)] opacity-80">
                  {node}
                </div>
                <h3 className="mt-5 font-serif text-[1.15rem] sm:text-[1.2rem] text-[var(--ink)] leading-[1.25]">
                  {title}
                </h3>
                <p className="mt-3 text-[13px] text-[var(--ink-muted)] leading-[1.88] max-w-[175px]">
                  {body}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── 3. OCCASIONS ─── */
function OccasionsSection() {
  const { data: cms, isPending } = useLevel5Cms();
  const headline = cms?.occasions.headline || "For every kind of celebration";
  const occasions = cms?.occasions.cards?.length
    ? cms.occasions.cards.map((card, i) => ({
        label: card.label,
        img: cmsSrc(isPending, card.imageUrl, defaultOccasions[i]?.img || spaceLevel5Dining),
        alt: card.alt || card.label.replace(/\n/g, " "),
      }))
    : defaultOccasions.map((o) => ({
        label: o.label,
        img: cmsSrc(isPending, undefined, o.img),
        alt: o.label.replace(/\n/g, " "),
      }));

  return (
    <section className="bg-[var(--cream)] pb-0">
      <Reveal className="text-center pb-9 sm:pb-11 px-4">
        <p
          className="heading-section font-normal text-[var(--ink)] text-[clamp(1.9rem,3.8vw,2.8rem)]"
        >
          {headline}{" "}
          <HeartOutline className="text-[var(--cocoa)] relative -top-0.5" />
        </p>
      </Reveal>

      {/* 5-column grid of tall rectangles — full width, no gaps */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {occasions.map((o, i) => (
          <motion.div
            key={`${o.label}-${i}`}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.75, delay: i * 0.09, ease }}
            className="group relative overflow-hidden"
            style={{ aspectRatio: "3/4" }}
          >
            {o.img ? (
            <img
              src={o.img}
              alt={o.alt}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.3s] ease-out group-hover:scale-[1.07]"
            />
            ) : null}
            {/* Dark overlay, slightly deeper on hover */}
            <div className="absolute inset-0 bg-black/38 group-hover:bg-black/52 transition-colors duration-500" />
            {/* Label bottom-center */}
            <div className="absolute bottom-0 left-0 right-0 pb-5 sm:pb-6 text-center">
              <p className="font-serif text-white text-[0.95rem] sm:text-[1.05rem] leading-[1.3] whitespace-pre-line">
                {o.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── 4. NOTE + GALLERY ─── */
function NoteAndGallerySection() {
  const { data: cms, isPending } = useLevel5Cms();
  const portraitSrc = cmsSrc(isPending, cms?.note.portraitUrl, spaceLevel5Interior);
  const portraitAlt = cms?.note.portraitAlt || "The Off White owners";
  const noteHeadline = cms?.note.headline || "A note from us.";
  const noteBody =
    cms?.note.body ||
    "The Off White was never just a restaurant. It was our way of creating a place where memories are made. Thank you for letting us be a part of your special moments.";
  const signOff = cms?.note.signOff || "With love,";
  const signature1 = cms?.note.signature1 || "Mrs Arati Dileep Menon";
  const signature2 =
    cms?.note.signature2 || "Head chef and curator Mr. Santosh Kumar Salapu";
  const walkHeadline = cms?.walk.headline || "Take a walk with us";
  const galleryWalk = cms?.walk.thumbs?.length
    ? cms.walk.thumbs.map((thumb, i) => ({
        label: thumb.label,
        img: cmsSrc(isPending, thumb.imageUrl, defaultGalleryWalk[i]?.img || spaceLevel5),
      }))
    : defaultGalleryWalk.map((g) => ({
        ...g,
        img: cmsSrc(isPending, undefined, g.img),
      }));

  return (
    <section className="bg-[var(--cream)] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.65fr)_minmax(0,0.85fr)_minmax(0,1.5fr)] gap-8 lg:gap-12 items-start">
          {/* LEFT — portrait */}
          <Reveal>
            <div className="overflow-hidden aspect-[3/4] max-w-[250px] sm:max-w-[280px] mx-auto lg:mx-0 shadow-[0_20px_60px_-20px_rgba(43,33,24,0.25)]">
              {portraitSrc ? (
              <img
                src={portraitSrc}
                alt={portraitAlt}
                className="w-full h-full object-cover object-center transition-transform duration-[1.4s] hover:scale-[1.04]"
              />
              ) : null}
            </div>
          </Reveal>

          {/* CENTER — note */}
          <Reveal delay={0.1} className="flex flex-col justify-center lg:pt-4">
            <h3
              className="heading-section text-[1.55rem] sm:text-[1.7rem] text-[var(--ink)] leading-[1.3]"
            >
              {noteHeadline}{" "}
              <HeartOutline className="text-[var(--cocoa)] relative -top-0.5" />
            </h3>
            <p className="mt-5 text-[13px] sm:text-[13.5px] text-[var(--ink-muted)] leading-[2] max-w-[280px]">
              {noteBody}
            </p>
            <p className="mt-4 text-[13px] text-[var(--ink-muted)]">{signOff}</p>
            <p
              className="mt-1 text-[1.9rem] text-[var(--cocoa)]"
              style={{ fontFamily: "Allura, cursive" }}
            >
              {signature1}
            </p>
            <p
              className="mt-1 text-[1.35rem] sm:text-[1.5rem] text-[var(--cocoa)]"
              style={{ fontFamily: "Allura, cursive" }}
            >
              {signature2}
            </p>
          </Reveal>

          {/* RIGHT — walk gallery */}
          <Reveal delay={0.2}>
            <h3
              className="heading-section text-[1.55rem] sm:text-[1.7rem] text-[var(--ink)] mb-6 leading-[1.3]"
            >
              {walkHeadline}{" "}
              <HeartOutline className="text-[var(--cocoa)] relative -top-0.5" />
            </h3>
            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {galleryWalk.map((g, i) => (
                <motion.div
                  key={`${g.label}-${i}`}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.65, delay: i * 0.08, ease }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="relative overflow-hidden w-full aspect-[2/3] arch-top group">
                    {g.img ? (
                    <img
                      src={g.img}
                      alt={g.label}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                    />
                    ) : null}
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-400" />
                  </div>
                  <p className="text-[7.5px] sm:text-[8.5px] uppercase tracking-[0.16em] text-center text-[var(--ink-muted)] leading-tight px-0.5">
                    {g.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ─── 5. GOLDEN HOUR + BOOKING ─── */
function GoldenHourSection() {
  const { data: cms, isPending } = useLevel5Cms();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const backgroundSrc = cmsSrc(isPending, cms?.goldenHour.backgroundUrl, spaceHero);
  const headlineLines = linesFromSlash(
    cms?.goldenHour.headline || "Golden hour / belongs to / your moments.",
  );

  return (
    <section ref={ref} className="relative min-h-[520px] lg:min-h-[580px] overflow-hidden">
      {/* Parallax background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 will-change-transform">
        {backgroundSrc ? (
        <img
          src={backgroundSrc}
          alt="Golden hour at The Off White terrace"
          className="w-full h-full object-cover"
          loading="lazy"
        />
        ) : null}
        <div className="absolute inset-0 bg-black/45" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 lg:px-10 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left */}
        <Reveal>
          <h2
            className="heading-section font-normal text-white leading-[1.08] text-[clamp(2rem,4.5vw,3.6rem)]"
          >
            {headlineLines.map((line, i) => (
              <span key={`${line}-${i}`}>
                {i > 0 ? <br /> : null}
                {line}
                {i === headlineLines.length - 1 ? (
                  <>
                    {" "}
                    <HeartOutline className="text-white/85 relative -top-1" />
                  </>
                ) : null}
              </span>
            ))}
          </h2>
        </Reveal>

        {/* Right */}
        <Reveal delay={0.15}>
          <BookingCard />
        </Reveal>
      </div>
    </section>
  );
}
