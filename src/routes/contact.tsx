import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { MapPin, Phone, Mail, Clock, Calendar } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { ReserveTableLink } from "@/components/ReserveTableLink";
import { useContactCms } from "@/lib/contact-cms";
import { cmsSrc } from "@/lib/cms-src";
import { useSiteSettings } from "@/lib/site-settings";
import contactHero from "@/assets/contact-hero.jpg";
import reserveImg from "@/assets/contact-reserve.jpg";
import contactEnquiryBg from "@/assets/contact-enquiry-bg.jpg";
import contactEnquiryLeaf from "@/assets/contact-enquiry-leaf.png";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — The Off White" },
      {
        name: "description",
        content:
          "Reach out for reservations, events or enquiries at The Off White Bar & Grill in Navelim, Goa.",
      },
      { property: "og:title", content: "Contact Us — The Off White" },
      {
        property: "og:description",
        content: "We'd love to hear from you. Reserve a table or plan your evening with us.",
      },
    ],
  }),
  component: ContactPage,
});

const ease = [0.22, 1, 0.36, 1] as const;

function ParallaxImage({
  src,
  alt,
  containerClassName = "",
}: {
  src?: string;
  alt: string;
  containerClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${containerClassName}`}>
      <motion.div style={{ y }} className="absolute inset-0 will-change-transform">
        {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out hover:scale-[1.03]"
        />
        ) : null}
      </motion.div>
    </div>
  );
}

function ContactHero() {
  const { data: cms, isPending } = useContactCms();
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "5%"]);
  const imageSrc = cmsSrc(isPending, cms?.hero.imageUrl, contactHero);
  const headline = cms?.hero.headline || "Contact Us";
  const body =
    cms?.hero.body ||
    "We'd love to hear from you. Reach out for reservations, events or any inquiries.";

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-[var(--cream)] pt-[calc(5.5rem+0.5rem+env(safe-area-inset-top,0px))] sm:pt-0 sm:h-[min(78svh,760px)] lg:h-[min(82svh,860px)]"
    >
      <motion.div
        style={reduceMotion ? undefined : { y: bgY }}
        className="relative sm:absolute sm:inset-0 bg-[var(--cream)] will-change-transform"
      >
        {imageSrc ? (
        <motion.img
          src={imageSrc}
          alt="Sunlit wall with palm leaf shadows and arched dining room at The Off White"
          initial={reduceMotion ? false : { scale: 1.02 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.8, ease }}
          className="block w-full h-auto sm:absolute sm:inset-0 sm:h-full sm:w-full sm:object-cover sm:object-left lg:object-[8%_center]"
        />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--cream)]/65 via-[var(--cream)]/15 to-transparent sm:bg-gradient-to-r sm:from-[var(--cream)]/30 sm:via-transparent sm:to-transparent" />
      </motion.div>

      <motion.div
        style={reduceMotion ? undefined : { y: contentY }}
        className="absolute inset-x-0 bottom-0 z-10 mx-auto flex max-w-[1400px] px-6 pb-10 sm:relative sm:inset-auto sm:h-full sm:items-center sm:px-8 lg:px-10 xl:px-12 sm:pt-[6rem] sm:pb-8"
      >
        <div className="max-w-[380px] sm:max-w-[420px]">
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease }}
            className="heading-hero font-normal text-[var(--ink)] leading-[1.1]"
            style={{ fontSize: "clamp(2.4rem, 4vw, 3.2rem)" }}
          >
            {headline}
          </motion.h1>

          <motion.span
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.45, ease }}
            className="mt-5 block h-px w-12 origin-left bg-[var(--cocoa)]"
            aria-hidden
          />

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease }}
            className="mt-5 max-w-[280px] font-serif text-[13.5px] sm:text-[14px] leading-[1.8] text-[var(--ink)]/80"
          >
            {body}
          </motion.p>
        </div>
      </motion.div>
    </section>
  );
}

function ContactInfoGrid() {
  const reduceMotion = useReducedMotion();
  const settings = useSiteSettings();
  const { data: cms } = useContactCms();
  const labels = cms?.infoLabels || {
    location: "Location",
    phone: "Phone",
    email: "Email",
    hours: "Hours",
  };
  const contactItems = [
    {
      Icon: MapPin,
      label: labels.location,
      lines: [
        settings.address_line1,
        settings.address_line2,
        `${settings.city}, ${settings.state} ${settings.pincode}`,
      ],
      href: settings.google_maps_url,
    },
    {
      Icon: Phone,
      label: labels.phone,
      lines: [settings.phone_display],
      href: `tel:${settings.phone_primary}`,
    },
    {
      Icon: Mail,
      label: labels.email,
      lines: [settings.email_primary],
      href: `mailto:${settings.email_primary}`,
    },
    {
      Icon: Clock,
      label: labels.hours,
      lines: [settings.contact_hours_text.replace(" (All Days)", ""), "(All Days)"],
    },
  ];

  return (
    <section className="bg-[var(--cream)] border-b border-[var(--border)]/60">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)]/70">
          {contactItems.map((item, i) => {
            const inner = (
              <>
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease }}
                >
                  <item.Icon
                    size={22}
                    strokeWidth={1.15}
                    className="text-[var(--cocoa)]"
                    aria-hidden
                  />
                </motion.div>

                <motion.h2
                  initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.65, delay: 0.08 + i * 0.1, ease }}
                  className="mt-4 text-[10px] uppercase tracking-[0.28em] font-semibold text-[var(--cocoa)]"
                >
                  {item.label}
                </motion.h2>

                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.7, delay: 0.14 + i * 0.1, ease }}
                  className="mt-3 space-y-0.5 text-[12.5px] sm:text-[13px] leading-[1.7] text-[var(--ink)]"
                >
                  {item.lines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </motion.div>
              </>
            );

            const cellClass =
              "group flex flex-col px-7 sm:px-8 lg:px-10 xl:px-12 py-9 sm:py-10 lg:py-12 transition-colors duration-300";

            if ("href" in item && item.href) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.Icon === MapPin ? "_blank" : undefined}
                  rel={item.Icon === MapPin ? "noopener noreferrer" : undefined}
                  className={`${cellClass} hover:bg-[var(--cream-warm)]/50`}
                >
                  {inner}
                </a>
              );
            }

            return (
              <div key={item.label} className={cellClass}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MapPinMarker({ pinLabel = "The Off White" }: { pinLabel?: string }) {
  return (
    <div className="relative z-[1] flex items-end gap-1.5 sm:gap-2">
      <div className="flex flex-col items-center">
        <svg
          width="26"
          height="34"
          viewBox="0 0 28 36"
          aria-hidden
          className="shrink-0"
        >
          <path
            className="contact-map-pin"
            d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.268 21.732 0 14 0z"
          />
          <circle className="contact-map-pin-hole" cx="14" cy="14" r="4.5" />
        </svg>
        <span className="contact-map-pin-dot" aria-hidden />
      </div>
      <span className="contact-map-pin-label">{pinLabel}</span>
    </div>
  );
}

function MapSection() {
  const settings = useSiteSettings();
  const { data: cms } = useContactCms();
  const pinLabel = cms?.map.pinLabel || "The Off White";
  const iframeTitle =
    cms?.map.iframeTitle || "The Off White Bar & Grill on map — Navelim, Goa";

  return (
    <section className="relative w-full overflow-hidden">
      <Reveal>
        <a
          href={settings.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-map-wrap group relative block h-[220px] sm:h-[260px] lg:h-[300px] w-full"
          aria-label="View The Off White on Google Maps"
        >
          <iframe
            title={iframeTitle}
            src={settings.google_maps_embed_url}
            className="contact-map-iframe absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            tabIndex={-1}
          />
          <div
            className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center"
            aria-hidden
          >
            <div className="contact-map-marker-position">
              <span className="contact-map-pin-cover" />
              <MapPinMarker pinLabel={pinLabel} />
            </div>
          </div>
        </a>
      </Reveal>
    </section>
  );
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function formatEnquiryDate(value: string) {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}-${month}-${year}`;
  }
  return value;
}

function PrivateEnquiryForm({
  compact = false,
  onInteractionChange,
  onShowEnquiry,
}: {
  compact?: boolean;
  onInteractionChange?: (active: boolean) => void;
  onShowEnquiry?: () => void;
}) {
  const { data: cms } = useContactCms();
  const settings = useSiteSettings();
  const form = cms?.form;
  const [status, setStatus] = useState<"idle" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState(
    form?.errorMessage || "Please complete all required fields.",
  );
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof EnquiryData, string>>>({});
  const [data, setData] = useState<EnquiryData>({
    name: "",
    email: "",
    occasion: "",
    date: "",
    guests: "",
    message: "",
  });

  useEffect(() => {
    const stored = window.sessionStorage.getItem("level5-enquiry");
    if (!stored) return;

    try {
      const enquiry = JSON.parse(stored) as { name?: string; eventName?: string };
      setData((current) => ({
        ...current,
        name: enquiry.name || current.name,
        occasion: enquiry.eventName || "Level 5 Event",
      }));
      window.sessionStorage.removeItem("level5-enquiry");
    } catch {
      window.sessionStorage.removeItem("level5-enquiry");
    }
  }, []);

  const set =
    (k: keyof EnquiryData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setData((d) => ({ ...d, [k]: value }));
      setFieldErrors((errors) => {
        if (!errors[k]) return errors;
        const next = { ...errors };
        delete next[k];
        return next;
      });
      if (status === "error") setStatus("idle");
    };

  const validate = () => {
    const errors: Partial<Record<keyof EnquiryData, string>> = {};
    const name = data.name.trim();
    const email = data.email.trim();
    const occasion = data.occasion.trim();
    const date = data.date.trim();
    const guests = data.guests.trim();

    if (!name) errors.name = "Please enter your name.";
    if (!email) errors.email = "Please enter your email.";
    else if (!isValidEmail(email)) errors.email = "Please enter a valid email address.";
    if (!occasion) errors.occasion = "Please enter the occasion.";
    if (!date) errors.date = "Please choose a date.";
    if (!guests) errors.guests = "Please enter the guest count.";
    else if (!/^\d+\s*$/.test(guests) && !/^\d+\s*guests?$/i.test(guests)) {
      errors.guests = "Please enter a valid guest count.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onShowEnquiry?.();
    onInteractionChange?.(true);

    if (!validate()) {
      setErrorMessage(form?.errorMessage || "Please complete all required fields.");
      setStatus("error");
      return;
    }

    const lines = [
      "Hi! I’d like to enquire about a private event at Off White.",
      "",
      `Name: ${data.name.trim()}`,
      `Email: ${data.email.trim()}`,
      `Occasion: ${data.occasion.trim()}`,
      `Date: ${formatEnquiryDate(data.date.trim())}`,
      `Guests: ${data.guests.trim()}`,
    ];
    if (data.message.trim()) {
      lines.push("", `Details: ${data.message.trim()}`);
    }

    const whatsappUrl =
      "https://wa.me/" +
      settings.whatsapp_number +
      "?text=" +
      encodeURIComponent(lines.join("\n"));

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setStatus("idle");
  };

  const handleFormFocus = () => {
    onShowEnquiry?.();
    onInteractionChange?.(true);
  };

  const handleFormBlur = (e: React.FocusEvent<HTMLFormElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      onInteractionChange?.(false);
    }
  };

  const fieldClass = (key: keyof EnquiryData) =>
    `enquiry-field${fieldErrors[key] ? " border-[var(--cocoa-dark)]" : ""}`;

  return (
    <form
      onSubmit={submit}
      onFocus={handleFormFocus}
      onBlur={handleFormBlur}
      noValidate
      className={compact ? "contact-ending-enquiry-form" : "space-y-4"}
    >
      <div className={compact ? "enquiry-field-row" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
        <div>
          <input
            className={fieldClass("name")}
            placeholder={form?.namePlaceholder || "Your Name"}
            value={data.name}
            onChange={set("name")}
            aria-invalid={Boolean(fieldErrors.name)}
            autoComplete="name"
          />
          {fieldErrors.name ? (
            <p className="mt-1.5 text-[11px] text-[var(--cocoa-dark)]">{fieldErrors.name}</p>
          ) : null}
        </div>
        <div>
          <input
            type="email"
            className={fieldClass("email")}
            placeholder={form?.emailPlaceholder || "Email"}
            value={data.email}
            onChange={set("email")}
            aria-invalid={Boolean(fieldErrors.email)}
            autoComplete="email"
          />
          {fieldErrors.email ? (
            <p className="mt-1.5 text-[11px] text-[var(--cocoa-dark)]">{fieldErrors.email}</p>
          ) : null}
        </div>
      </div>

      <div className={compact ? "enquiry-field-row" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
        <div>
          <input
            className={fieldClass("occasion")}
            placeholder={form?.occasionPlaceholder || "Occasion"}
            value={data.occasion}
            onChange={set("occasion")}
            aria-invalid={Boolean(fieldErrors.occasion)}
          />
          {fieldErrors.occasion ? (
            <p className="mt-1.5 text-[11px] text-[var(--cocoa-dark)]">{fieldErrors.occasion}</p>
          ) : null}
        </div>
        <div className={compact ? "contact-ending-enquiry-date relative" : "relative"}>
          <input
            type={compact ? "text" : "date"}
            className={`${fieldClass("date")} ${compact ? "" : "pr-10 [color-scheme:light]"}`}
            placeholder={compact ? form?.datePlaceholder || "dd-mm-yyyy" : undefined}
            value={data.date}
            onChange={set("date")}
            aria-invalid={Boolean(fieldErrors.date)}
          />
          <Calendar
            size={compact ? 14 : 15}
            strokeWidth={1.35}
            className={
              compact
                ? "contact-ending-enquiry-date-icon"
                : "pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]"
            }
            aria-hidden
          />
          {fieldErrors.date ? (
            <p className="mt-1.5 text-[11px] text-[var(--cocoa-dark)]">{fieldErrors.date}</p>
          ) : null}
        </div>
      </div>

      <div>
        <input
          className={fieldClass("guests")}
          placeholder={form?.guestsPlaceholder || "Approx. guests"}
          value={data.guests}
          onChange={set("guests")}
          inputMode="numeric"
          aria-invalid={Boolean(fieldErrors.guests)}
        />
        {fieldErrors.guests ? (
          <p className="mt-1.5 text-[11px] text-[var(--cocoa-dark)]">{fieldErrors.guests}</p>
        ) : null}
      </div>

      <textarea
        className={`enquiry-field ${compact ? "" : "min-h-[112px] resize-none"}`}
        placeholder={
          form?.messagePlaceholder || "Tell us a little about what you're planning..."
        }
        value={data.message}
        onChange={set("message")}
      />

      {status === "error" && Object.keys(fieldErrors).length > 0 ? (
        <p className="text-sm text-[var(--cocoa-dark)]">{errorMessage}</p>
      ) : null}

      <button type="submit" className="enquiry-submit">
        {form?.submitLabel || "Send Enquiry"}
      </button>
    </form>
  );
}

type EnquiryData = {
  name: string;
  email: string;
  occasion: string;
  date: string;
  guests: string;
  message: string;
};

const ENDING_CYCLE_MS = 3000;
const ENDING_FADE_S = 2;

function ContactEndingSection() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const settings = useSiteSettings();
  const { data: cms, isPending } = useContactCms();
  const isInView = useInView(ref, { amount: 0.35, margin: "-8% 0px" });
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [cyclePaused, setCyclePaused] = useState(false);
  const reserveVisible = reduceMotion ? true : !showEnquiry;
  const enquiryVisible = reduceMotion ? false : showEnquiry;

  const reserveImage = cmsSrc(isPending, cms?.reservePanel.imageUrl, reserveImg);
  const reserveEyebrow = cms?.reservePanel.eyebrow || "Plan Your Evening";
  const reserveHeadline = cms?.reservePanel.headline || "Reserve a Table";
  const reserveBody =
    cms?.reservePanel.body || "Great food, warm light and even better company.";
  const reserveButtonLabel = cms?.reservePanel.button.label || "Reserve a Table";

  const enquiryBg = cmsSrc(isPending, cms?.enquiryPanel.backgroundUrl, contactEnquiryBg);
  const enquiryLeaf = cmsSrc(isPending, cms?.enquiryPanel.leafDecorUrl, contactEnquiryLeaf);
  const enquiryEyebrow = cms?.enquiryPanel.eyebrow || "Private Enquiry";
  const enquiryHeadline = cms?.enquiryPanel.headline || "Hosting something special?";
  const enquiryBody =
    cms?.enquiryPanel.body ||
    "Tell us about your occasion — date, guest count, and the mood you're after. Our team will respond within 24 hours with a proposal tailored to you.";

  useEffect(() => {
    if (!isInView) {
      setShowEnquiry(false);
      setCyclePaused(false);
      return;
    }
    if (reduceMotion || cyclePaused) return;

    const id = window.setInterval(() => {
      setShowEnquiry((prev) => !prev);
    }, ENDING_CYCLE_MS);

    return () => window.clearInterval(id);
  }, [isInView, reduceMotion, cyclePaused]);

  return (
    <section ref={ref} id="reserve" className="contact-ending-scroll scroll-mt-24">
      <div className="contact-ending-sticky">
        <motion.div
          className={`contact-ending-panel z-10${reserveVisible ? "" : " max-lg:hidden"}`}
          animate={{ opacity: reserveVisible ? 1 : 0 }}
          transition={{ duration: ENDING_FADE_S, ease }}
        >
          <div className="grid h-full grid-cols-1 lg:grid-cols-2">
            <div className="relative min-h-[280px] sm:min-h-[340px] lg:min-h-[420px]">
              <ParallaxImage
                src={reserveImage}
                alt="Carved wooden console with mirror and warm foyer decor at The Off White"
                containerClassName="h-full min-h-[280px] sm:min-h-[340px] lg:min-h-[420px]"
              />
            </div>

            <div className="flex items-center bg-[var(--cream)] px-8 sm:px-12 lg:px-14 xl:px-16 py-12 sm:py-14 lg:py-16">
              <div className="max-w-[320px]">
                <p className="text-[10px] uppercase tracking-[0.32em] font-semibold text-[var(--gold)]">
                  {reserveEyebrow}
                </p>

            <motion.h2
              initial={reduceMotion ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.85, delay: 0.08, ease }}
              className="mt-4 heading-section font-normal text-[var(--ink)] leading-[1.1]"
              style={{ fontSize: "clamp(1.9rem, 3vw, 2.6rem)" }}
            >
              {reserveHeadline}
            </motion.h2>

                <span className="mt-5 block h-px w-12 bg-[var(--cocoa)]" aria-hidden />

                <p className="mt-5 text-[13px] sm:text-[13.5px] leading-[1.8] text-[var(--ink-muted)]">
                  {reserveBody}
                </p>

                <div className="mt-7">
                  <ReserveTableLink className="inline-flex items-center justify-center bg-[var(--cocoa)] px-7 py-3 text-[10px] uppercase tracking-[0.28em] font-semibold text-white transition-[transform,box-shadow,background-color] duration-300 hover:bg-[var(--cocoa-dark)] hover:shadow-[0_8px_24px_-10px_rgba(113,67,29,0.45)]">
                    {reserveButtonLabel}
                  </ReserveTableLink>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          className={`contact-ending-panel contact-enquiry-section z-20 ${enquiryVisible ? "pointer-events-auto" : "pointer-events-none"}${enquiryVisible ? "" : " max-lg:hidden"}`}
          animate={{ opacity: enquiryVisible ? 1 : 0 }}
          transition={{ duration: ENDING_FADE_S, ease }}
        >
          {enquiryBg ? (
          <img src={enquiryBg} alt="" aria-hidden className="contact-enquiry-bg" />
          ) : null}

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 lg:h-full lg:min-h-[420px] lg:items-center">
            <div className="relative flex max-lg:flex-col max-lg:justify-start bg-transparent px-8 sm:px-10 lg:px-12 xl:px-14 py-10 lg:h-full lg:min-h-0 lg:items-center lg:py-0">
              <div className="contact-enquiry-leaf-wrap" aria-hidden>
                {enquiryLeaf ? (
                <img src={enquiryLeaf} alt="" className="contact-enquiry-leaf" />
                ) : null}
              </div>

              <div className="contact-ending-enquiry-copy relative z-[1]">
                <p className="text-[10px] uppercase tracking-[0.32em] font-semibold text-[var(--gold)]">
                  {enquiryEyebrow}
                </p>

                <span className="mt-3 block h-px w-10 bg-[var(--cocoa)]" aria-hidden />

                <h2
                  className="mt-4 font-serif font-normal text-[var(--ink)] leading-[1.12]"
                  style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.2rem)" }}
                >
                  {enquiryHeadline}
                </h2>

                <p className="mt-4 text-[12.5px] sm:text-[13px] leading-[1.75] text-[var(--ink-muted)]">
                  {enquiryBody}
                </p>

                <div className="mt-5 space-y-2.5">
                  <a
                    href={`mailto:${settings.email_primary}`}
                    className="inline-flex items-center gap-2 text-[12px] text-[var(--ink)] transition-colors hover:text-[var(--cocoa)]"
                  >
                    <Mail size={13} strokeWidth={1.25} className="text-[var(--cocoa)]" aria-hidden />
                    {settings.email_primary}
                  </a>
                  <a
                    href={`tel:${settings.phone_primary}`}
                    className="flex items-center gap-2 text-[12px] text-[var(--ink)] transition-colors hover:text-[var(--cocoa)]"
                  >
                    <Phone size={13} strokeWidth={1.25} className="text-[var(--cocoa)]" aria-hidden />
                    {settings.phone_display}
                  </a>
                </div>
              </div>
            </div>

            <div className="contact-ending-enquiry flex items-center bg-[var(--cream)] px-6 sm:px-8 lg:px-10 xl:px-12 py-8 sm:py-10 lg:py-12">
              <div className="enquiry-form-card w-full">
                <PrivateEnquiryForm
                  compact
                  onInteractionChange={setCyclePaused}
                  onShowEnquiry={() => setShowEnquiry(true)}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ContactPage() {
  useEffect(() => {
    const h = window.location.hash.replace("#", "");
    if (!h) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(h);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  return (
    <div className="overflow-x-hidden bg-[var(--cream)]">
      <ContactHero />
      <ContactInfoGrid />
      <MapSection />
      <ContactEndingSection />
    </div>
  );
}
