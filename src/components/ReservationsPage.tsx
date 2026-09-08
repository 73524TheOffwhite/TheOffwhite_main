import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  Lock,
  MapPin,
  Pencil,
  Sparkles,
  Users,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useRouterState } from "@tanstack/react-router";
import heroImg from "@/assets/offwhite-dining-pano.jpg";
import { isReserveStepOneHash, RESERVE_STEP_ONE_EVENT } from "@/lib/reserve";
import { useSiteSettings } from "@/lib/site-settings";
import { isBlackoutDate, useReservationAvailability } from "@/lib/reservation-availability";
import { submitReservation } from "@/lib/supabase-api";
import { useReservationsCms } from "@/lib/reservations-cms";
import { cmsSrc } from "@/lib/cms-src";

const ease = [0.22, 1, 0.36, 1] as const;

const OCCASIONS = ["Birthday", "Anniversary", "Special Occasion", "Corporate"] as const;

const LOCATIONS = [
  { id: "level4" as const, label: "LEVEL 4", sub: "Fine Dining & Bar" },
  { id: "level5" as const, label: "LEVEL 5", sub: "Events & Parties" },
];

type LocationId = (typeof LOCATIONS)[number]["id"];
type Occasion = string;

type BookingData = {
  date: string;
  time: string;
  guests: number;
  location: LocationId;
  occasion: Occasion | "";
  name: string;
  phone: string;
  specialRequest: string;
};

const defaultBooking: BookingData = {
  date: "",
  time: "",
  guests: 2,
  location: "level4",
  occasion: "",
  name: "",
  phone: "",
  specialRequest: "",
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.549 4.09 1.51 5.81L0 24l6.35-1.66A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.82 9.82 0 0 1-5.01-1.37l-.36-.214-3.76.98 1.004-3.66-.235-.374A9.82 9.82 0 0 1 2.18 12C2.18 6.57 6.57 2.18 12 2.18S21.82 6.57 21.82 12 17.43 21.82 12 21.82z" />
    </svg>
  );
}

function FloralCorner({ className = "", flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 180 180"
      fill="none"
      className={`pointer-events-none select-none ${className}`}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden
    >
      <g stroke="var(--cocoa)" strokeWidth="0.7" opacity="0.22">
        <path d="M20 140 C 40 120, 60 100, 90 90" />
        <path d="M30 150 C 55 130, 75 115, 100 105" />
        <ellipse cx="95" cy="88" rx="10" ry="4" transform="rotate(-25 95 88)" />
        <ellipse cx="78" cy="98" rx="8" ry="3.5" transform="rotate(15 78 98)" />
        <ellipse cx="108" cy="95" rx="8" ry="3.5" transform="rotate(-40 108 95)" />
        <circle cx="92" cy="90" r="3" fill="var(--gold)" fillOpacity="0.35" stroke="none" />
        <path d="M10 160 Q 30 145 50 155" />
        <ellipse cx="48" cy="152" rx="7" ry="3" transform="rotate(20 48 152)" />
      </g>
    </svg>
  );
}

function TrustBadge({ className = "" }: { className?: string }) {
  const { data: cms } = useReservationsCms();
  return (
    <p className={`inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-[var(--ink-muted)] ${className}`}>
      <Lock size={11} strokeWidth={1.5} className="shrink-0" aria-hidden />
      {cms?.hero.trustLine || "Your details are safe with us"}
    </p>
  );
}

function formatDisplayDate(iso: string) {
  if (!iso) return "";
  try {
    return format(parseISO(iso), "d MMMM yyyy");
  } catch {
    return iso;
  }
}

function buildWhatsAppMessage(data: BookingData) {
  const loc = LOCATIONS.find((l) => l.id === data.location);
  const lines = [
    "Hi, I'd like to reserve a table at The Off White.",
    "",
    `Date: ${formatDisplayDate(data.date)}`,
    `Time: ${data.time}`,
    `Guests: ${data.guests}`,
    `Location: ${loc?.label} — ${loc?.sub}`,
  ];
  if (data.occasion) lines.push(`Occasion: ${data.occasion}`);
  if (data.name) lines.push(`Name: ${data.name}`);
  if (data.phone) lines.push(`Phone: +91 ${data.phone}`);
  if (data.specialRequest) lines.push(`Special request: ${data.specialRequest}`);
  return encodeURIComponent(lines.join("\n"));
}

function HeroSection({ onBook }: { onBook: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const settings = useSiteSettings();
  const { data: cms, isPending } = useReservationsCms();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  const whatsappUrl =
    "https://wa.me/" +
    settings.whatsapp_number +
    "?text=" +
    encodeURIComponent(
      "Hi! I’d like to reserve a table at Off White. Could you please help me with the reservation?",
    );

  const eyebrow = cms?.hero.eyebrow || "Reservations";
  const headline = cms?.hero.headline || "Reserve A Table";
  const tagline = cms?.hero.tagline || "Good food. Warm ambience. Memories to be made.";
  const button1 = cms?.hero.button1Label || "Book Your Table";
  const button2 = cms?.hero.button2Label || "WhatsApp Concierge";
  const imageSrc = cmsSrc(isPending, cms?.hero.imageUrl, heroImg);

  return (
    <section
      ref={ref}
      className="relative min-h-[min(92svh,820px)] w-full overflow-hidden pt-[calc(5.5rem+env(safe-area-inset-top,0px))] sm:pt-0 sm:min-h-[min(88svh,780px)]"
    >
      <motion.div
        style={reduceMotion ? undefined : { y: bgY }}
        className="absolute inset-0 will-change-transform"
      >
        {imageSrc ? (
        <motion.img
          src={imageSrc}
          alt="Warmly lit dining room at The Off White"
          initial={reduceMotion ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease }}
          className="h-full w-full object-cover object-center"
        />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/45 to-black/25 sm:from-black/68 sm:via-black/40 sm:to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20" />
      </motion.div>

      <motion.div
        style={reduceMotion ? undefined : { y: contentY }}
        className="relative z-10 mx-auto flex min-h-[min(92svh,820px)] max-w-[1400px] flex-col justify-center px-6 pb-28 pt-8 sm:min-h-[min(88svh,780px)] sm:px-10 sm:pb-24 sm:pt-[6.5rem] lg:px-14"
      >
        <div className="max-w-[520px] text-white">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-8 bg-white/70" aria-hidden />
            <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/90">
              {eyebrow}
            </span>
          </motion.div>

          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.95, delay: 0.35, ease }}
            className="mt-5 heading-hero font-normal leading-[1.05]"
            style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)" }}
          >
            {headline}
          </motion.h1>

          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.5, ease }}
            className="mt-5 max-w-[380px] text-[14px] leading-[1.75] text-white/82 sm:text-[15px]"
          >
            {tagline}
          </motion.p>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.65, ease }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
          >
            {/* <motion.button
              type="button"
              onClick={onBook}
              className="reserve-btn-primary px-8 py-3.5 text-[10px] sm:text-[11px]"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              {button1}
            </motion.button> */}

            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="reserve-btn-outline-light inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-[9.5px] sm:text-[10px]"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <WhatsAppIcon className="h-4 w-4 shrink-0" />
              <span>
                {button2}
                <span className="mt-0.5 block text-[9px] tracking-[0.18em] opacity-90">{settings.phone_display}</span>
              </span>
            </motion.a>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="mt-8 hidden sm:block"
          >
            <TrustBadge className="!text-white/55" />
          </motion.div>
        </div>
      </motion.div>

      {/* <motion.button
        type="button"
        onClick={onBook}
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{
          opacity: { delay: 1.1, duration: 0.6 },
          y: { delay: 1.1, duration: 2.2, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute bottom-8 left-1/2 z-10 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border border-white/50 bg-black/25 text-white backdrop-blur-sm transition-colors hover:border-white hover:bg-black/40"
        aria-label="Scroll to booking form"
      >
        <ChevronDown size={18} />
      </motion.button> */}
    </section>
  );
}

function StepIndicator({ step }: { step: 1 | 2 }) {
  const { data: cms } = useReservationsCms();
  const steps = [
    { n: "01", label: cms?.steps.step1Label || "Book Your Table" },
    { n: "02", label: cms?.steps.step2Label || "Confirm & Reserve" },
  ] as const;

  return (
    <div className="reserve-step-indicator" role="list" aria-label="Reservation progress">
      {steps.map((s, i) => {
        const num = (i + 1) as 1 | 2;
        const active = step >= num;
        const current = step === num;
        return (
          <div key={s.n} className="flex flex-1 items-center gap-3 sm:gap-4" role="listitem">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <motion.span
                layout
                className={`reserve-step-dot ${active ? "reserve-step-dot--active" : ""} ${current ? "reserve-step-dot--current" : ""} ${step > num ? "reserve-step-dot--done" : ""}`}
                aria-current={current ? "step" : undefined}
              >
                {active && step > num ? <Check size={12} strokeWidth={2.5} /> : s.n}
              </motion.span>
              <span
                className={`hidden text-[10px] font-semibold uppercase tracking-[0.22em] sm:inline ${
                  active ? "text-[var(--cocoa)]" : "text-[var(--ink-muted)]/60"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="relative mx-1 h-px flex-1 overflow-hidden bg-[var(--border)] sm:mx-2">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-[var(--cocoa)]"
                  initial={false}
                  animate={{ width: step > 1 ? "100%" : "0%" }}
                  transition={{ duration: 0.55, ease }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--ink-muted)]">
      {children}
    </span>
  );
}

function StepOneForm({
  data,
  onChange,
  onContinue,
  errors,
  timeSlots,
  maxGuests,
  dateBlocked,
}: {
  data: BookingData;
  onChange: (patch: Partial<BookingData>) => void;
  onContinue: () => void;
  errors: Partial<Record<"date" | "time", boolean>>;
  timeSlots: string[];
  maxGuests: number;
  dateBlocked: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const { data: cms } = useReservationsCms();
  const today = new Date().toISOString().split("T")[0];
  const guestOptions = Array.from({ length: maxGuests }, (_, i) => i + 1);
  const locations = LOCATIONS.map((loc) => {
    const fromCms = cms?.step1.locations?.find((item) => item.id === loc.id);
    return {
      ...loc,
      label: fromCms?.label || loc.label,
      sub: fromCms?.sub || loc.sub,
    };
  });
  const occasions =
    cms?.step1.occasions?.length
      ? cms.step1.occasions.map((item) => item.label)
      : [...OCCASIONS];
  const stepTitle = cms?.step1.title || "Book Your Table";
  const continueLabel = cms?.step1.continueLabel || "Continue to Confirm";
  const unavailableMessage =
    cms?.step1.unavailableMessage || "Reservations are unavailable for the selected date.";

  return (
    <motion.div
      key="step-1"
      initial={reduceMotion ? false : { opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: 24 }}
      transition={{ duration: 0.45, ease }}
      className="w-full"
    >
      <h2 className="text-center text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--ink)]">
        {stepTitle}
      </h2>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-4 lg:gap-6">
        <div>
          <FieldLabel>Date</FieldLabel>
          <div className="relative">
            <input
              type="date"
              min={today}
              value={data.date}
              onChange={(e) => onChange({ date: e.target.value })}
              className={`reserve-field pr-10 ${errors.date ? "reserve-field--error" : ""}`}
              aria-invalid={errors.date}
            />
            <Calendar size={15} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
          </div>
          {dateBlocked && (
            <p className="mt-2 text-xs text-[var(--cocoa-dark)]">
              {unavailableMessage}
            </p>
          )}
        </div>

        <div>
          <FieldLabel>Time</FieldLabel>
          <div className="relative">
            <select
              value={data.time}
              onChange={(e) => onChange({ time: e.target.value })}
              className={`reserve-field appearance-none pr-10 ${errors.time ? "reserve-field--error" : ""}`}
              aria-invalid={errors.time}
            >
              <option value="">Select Time</option>
              {timeSlots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <Clock size={15} className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
            <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
          </div>
        </div>

        <div>
          <FieldLabel>Guests</FieldLabel>
          <div className="relative">
            <select
              value={data.guests}
              onChange={(e) => onChange({ guests: Number(e.target.value) })}
              className="reserve-field appearance-none pr-10"
            >
              {guestOptions.map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Guest" : "Guests"}
                </option>
              ))}
            </select>
            <Users size={15} className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
            <ChevronDown size={14} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <FieldLabel>Location</FieldLabel>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          {locations.map((loc) => {
            const selected = data.location === loc.id;
            return (
              <motion.button
                key={loc.id}
                type="button"
                onClick={() => onChange({ location: loc.id })}
                className={`reserve-location-card ${selected ? "reserve-location-card--selected" : ""}`}
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                aria-pressed={selected}
              >
                <span
                  className={`reserve-location-check ${selected ? "reserve-location-check--selected" : ""}`}
                  aria-hidden
                >
                  {selected && <Check size={11} strokeWidth={2.5} />}
                </span>
                <span className="text-left">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--ink)]">
                    {loc.label}
                  </span>
                  <span className="mt-1 block text-[12px] text-[var(--ink-muted)]">{loc.sub}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="mt-8">
        <FieldLabel>
          Occasion <span className="font-normal normal-case tracking-normal text-[var(--ink-muted)]/70">(Optional)</span>
        </FieldLabel>
        <div className="flex flex-wrap gap-2.5">
          {occasions.map((occ) => {
            const selected = data.occasion === occ;
            return (
              <motion.button
                key={occ}
                type="button"
                onClick={() => onChange({ occasion: selected ? "" : occ })}
                className={`reserve-occasion-chip ${selected ? "reserve-occasion-chip--selected" : ""}`}
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                aria-pressed={selected}
              >
                {occ}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="mt-10 flex justify-stretch sm:justify-end">
        <motion.button
          type="button"
          onClick={onContinue}
          className="reserve-btn-primary inline-flex w-full items-center justify-center gap-2 px-10 py-4 sm:w-auto"
          whileHover={reduceMotion ? undefined : { y: -2 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        >
          {continueLabel}
          <ChevronRight size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function BookingSummary({
  data,
  onEdit,
}: {
  data: BookingData;
  onEdit: () => void;
}) {
  const { data: cms } = useReservationsCms();
  const loc = LOCATIONS.find((l) => l.id === data.location);
  const fromCms = cms?.step1.locations?.find((item) => item.id === data.location);
  const locLabel = fromCms?.label || loc?.label || "";

  const rows = [
    { icon: Calendar, label: formatDisplayDate(data.date) },
    { icon: Clock, label: data.time },
    { icon: Users, label: `${data.guests} ${data.guests === 1 ? "Guest" : "Guests"}` },
    { icon: MapPin, label: locLabel ? `${locLabel.replace("LEVEL ", "Level ")}` : "" },
    ...(data.occasion ? [{ icon: Sparkles, label: data.occasion }] : []),
  ];

  return (
    <div className="reserve-summary-card">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--cocoa)]">
        {cms?.step2.summaryTitle || "Your Booking"}
      </h3>
      <ul className="mt-5 space-y-4">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-3 text-[13px] text-[var(--ink)]">
            <row.icon size={15} strokeWidth={1.4} className="shrink-0 text-[var(--cocoa)]" aria-hidden />
            {row.label}
          </li>
        ))}
      </ul>
      <button type="button" onClick={onEdit} className="reserve-edit-btn mt-6">
        <Pencil size={13} />
        {cms?.step2.editButtonLabel || "Edit Details"}
      </button>
    </div>
  );
}

function StepTwoForm({
  data,
  onChange,
  onConfirm,
  onEdit,
  status,
}: {
  data: BookingData;
  onChange: (patch: Partial<BookingData>) => void;
  onConfirm: () => void;
  onEdit: () => void;
  status: "idle" | "loading" | "error";
}) {
  const reduceMotion = useReducedMotion();
  const settings = useSiteSettings();
  const { data: cms } = useReservationsCms();
  const whatsappUrl = "https://wa.me/" + settings.whatsapp_number + "?text=" + buildWhatsAppMessage(data);
  const headline = cms?.step2.headline || "Almost There!";
  const body = cms?.step2.body || "Please confirm your details and we'll take care of the rest.";
  const namePlaceholder = cms?.step2.namePlaceholder || "Your Name";
  const phonePlaceholder = cms?.step2.phonePlaceholder || "Your phone number";
  const specialRequestPlaceholder =
    cms?.step2.specialRequestPlaceholder ||
    "Any dietary needs, seating preferences or celebrations we should know about?";
  const submitLabel = cms?.step2.submitLabel || "Confirm Reservation";
  const loadingText = cms?.step2.loadingText || "Confirming…";
  const errorMessage = cms?.step2.errorMessage || "Please check your details and try again.";
  const whatsappAlt = (cms?.step2.whatsappAltLabel || "Reserve via WhatsApp {phone}").replace(
    "{phone}",
    settings.phone_display,
  );

  return (
    <motion.div
      key="step-2"
      initial={reduceMotion ? false : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, x: -24 }}
      transition={{ duration: 0.45, ease }}
      className="w-full"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-20">
        <div className="order-1 lg:order-none">
          <h2
            className="heading-section font-normal text-[var(--ink)] leading-[1.1]"
            style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.5rem)" }}
          >
            {headline}
          </h2>
          <p className="mt-3 max-w-sm text-[13.5px] leading-[1.75] text-[var(--ink-muted)]">
            {body}
          </p>
          <div className="mt-8">
            <BookingSummary data={data} onEdit={onEdit} />
          </div>
        </div>

        <div className="order-2 lg:order-none">
          <div className="space-y-5">
            <div>
              <FieldLabel>Name</FieldLabel>
              <input
                type="text"
                placeholder={namePlaceholder}
                value={data.name}
                onChange={(e) => onChange({ name: e.target.value })}
                className="reserve-field"
                autoComplete="name"
              />
            </div>

            <div>
              <FieldLabel>Phone Number</FieldLabel>
              <div className="flex overflow-hidden rounded-sm border border-[var(--border)] bg-[#F0EAE2] transition-[border-color,box-shadow] focus-within:border-[var(--cocoa)] focus-within:shadow-[0_0_0_3px_oklch(0.494_0.105_55/0.1)]">
                <span className="flex shrink-0 items-center gap-2 border-r border-[var(--border)] bg-[#EBE4DC] px-3.5 py-3.5 text-[13px] text-[var(--ink)]">
                  <span aria-hidden>🇮🇳</span>
                  <span className="font-medium">+91</span>
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder={phonePlaceholder}
                  value={data.phone}
                  onChange={(e) => onChange({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3.5 text-sm text-[var(--ink)] outline-none placeholder:text-[var(--ink-muted)]/75"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div>
              <FieldLabel>
                Special Request{" "}
                <span className="font-normal normal-case tracking-normal text-[var(--ink-muted)]/70">(Optional)</span>
              </FieldLabel>
              <textarea
                rows={4}
                placeholder={specialRequestPlaceholder}
                value={data.specialRequest}
                onChange={(e) => onChange({ specialRequest: e.target.value })}
                className="reserve-field min-h-[110px] resize-y"
              />
            </div>
          </div>

          {status === "error" && (
            <p className="mt-4 text-sm text-[var(--cocoa-dark)]">
              {errorMessage}
            </p>
          )}

          <div className="mt-8 space-y-3">
            <motion.button
              type="button"
              onClick={onConfirm}
              disabled={status === "loading"}
              className="reserve-btn-primary flex w-full items-center justify-center gap-2 py-4 disabled:opacity-70"
              whileHover={status !== "loading" && !reduceMotion ? { y: -2 } : undefined}
              whileTap={status !== "loading" && !reduceMotion ? { scale: 0.98 } : undefined}
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {loadingText}
                </>
              ) : (
                submitLabel
              )}
            </motion.button>

            <motion.a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="reserve-btn-outline inline-flex w-full items-center justify-center gap-2.5 py-4 text-[10px]"
              whileHover={reduceMotion ? undefined : { y: -1 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              <WhatsAppIcon className="h-4 w-4" />
              {whatsappAlt}
            </motion.a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SuccessView({ data }: { data: BookingData }) {
  const reduceMotion = useReducedMotion();
  const { data: cms } = useReservationsCms();
  const headline = cms?.success.headline || "Reservation Received";
  const body = (cms?.success.bodyTemplate ||
    "Thank you, {name}. We'll confirm your table for {date} at {time} shortly via +91 {phone}.")
    .replace("{name}", data.name)
    .replace("{date}", formatDisplayDate(data.date))
    .replace("{time}", data.time)
    .replace("{phone}", data.phone);

  return (
    <motion.div
      key="success"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease }}
      className="mx-auto max-w-lg py-8 text-center"
    >
      <motion.div
        initial={reduceMotion ? false : { scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--cocoa)] text-white"
      >
        <Check size={28} strokeWidth={2} />
      </motion.div>
      <h2
        className="mt-6 heading-section font-normal text-[var(--ink)]"
        style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}
      >
        {headline}
      </h2>
      <p className="mt-3 text-[14px] leading-[1.75] text-[var(--ink-muted)]">
        {body}
      </p>
    </motion.div>
  );
}

export function ReservationsPage() {
  const formRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const availability = useReservationAvailability();
  const locationHash = useRouterState({ select: (s) => s.location.hash });
  const [step, setStep] = useState<1 | 2>(1);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [data, setData] = useState<BookingData>(defaultBooking);
  const [stepOneErrors, setStepOneErrors] = useState<Partial<Record<"date" | "time", boolean>>>({});
  const [dateBlocked, setDateBlocked] = useState(false);

  const scrollToForm = useCallback(() => {
    const scroll = () =>
      formRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    requestAnimationFrame(() => requestAnimationFrame(scroll));
  }, [reduceMotion]);

  const goToStepOne = useCallback(() => {
    setStep(1);
    setStatus("idle");
    setStepOneErrors({});
    requestAnimationFrame(() => scrollToForm());
  }, [scrollToForm]);

  useEffect(() => {
    if (isReserveStepOneHash(locationHash)) {
      goToStepOne();
    }
  }, [locationHash, goToStepOne]);

  useEffect(() => {
    const onReserve = () => goToStepOne();
    window.addEventListener(RESERVE_STEP_ONE_EVENT, onReserve);
    return () => window.removeEventListener(RESERVE_STEP_ONE_EVENT, onReserve);
  }, [goToStepOne]);

  const patch = useCallback((p: Partial<BookingData>) => {
    setData((d) => ({ ...d, ...p }));
    if (p.date !== undefined) {
      setStepOneErrors((e) => ({ ...e, date: false }));
      setDateBlocked(
        isBlackoutDate(p.date, p.location || data.location, availability.blackoutDates),
      );
    }
    if (p.time !== undefined) setStepOneErrors((e) => ({ ...e, time: false }));
    if (p.location !== undefined && data.date) {
      setDateBlocked(isBlackoutDate(data.date, p.location, availability.blackoutDates));
    }
  }, [availability.blackoutDates, data.date, data.location]);

  const handleContinue = () => {
    const errors: Partial<Record<"date" | "time", boolean>> = {};
    if (!data.date) errors.date = true;
    if (!data.time) errors.time = true;
    if (data.date && isBlackoutDate(data.date, data.location, availability.blackoutDates)) {
      errors.date = true;
      setDateBlocked(true);
    }
    if (errors.date || errors.time) {
      setStepOneErrors(errors);
      return;
    }
    setStep(2);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  };

  const handleConfirm = async () => {
    if (!data.name.trim() || data.phone.length < 10) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await submitReservation({
        reservationDate: data.date,
        reservationTime: data.time,
        guests: data.guests,
        location: data.location,
        occasion: data.occasion || undefined,
        name: data.name,
        phone: data.phone,
        specialRequest: data.specialRequest,
        source: "events_full",
      });
      setStatus("success");
    } catch (error) {
      setStatus("error");
      if (error instanceof Error && error.message) {
        console.error("Reservation submit failed:", error.message);
      }
    }
  };

  useEffect(() => {
    if (status === "success") {
      formRef.current?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
  }, [status, reduceMotion]);

  return (
    <div className="overflow-x-hidden bg-[var(--cream)]">
      <HeroSection onBook={scrollToForm} />

      {/* <section
        ref={formRef}
        id="book"
        className="relative scroll-mt-20 bg-[var(--cream)] py-14 sm:py-20 lg:py-24"
      >
        <FloralCorner className="absolute bottom-0 left-0 h-28 w-28 sm:h-36 sm:w-36" />
        <FloralCorner className="absolute bottom-0 right-0 h-28 w-28 sm:h-36 sm:w-36" flip />

        <div className="relative z-10 mx-auto max-w-[900px] px-6 sm:px-8 lg:max-w-[1040px] lg:px-10">
          {status !== "success" && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease }}
              className="mb-10 sm:mb-14"
            >
              <StepIndicator step={step} />
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {status === "success" ? (
              <SuccessView data={data} />
            ) : step === 1 ? (
              <StepOneForm
                data={data}
                onChange={patch}
                onContinue={handleContinue}
                errors={stepOneErrors}
                timeSlots={availability.timeSlots}
                maxGuests={availability.maxGuests}
                dateBlocked={dateBlocked}
              />
            ) : (
              <StepTwoForm
                data={data}
                onChange={patch}
                onConfirm={handleConfirm}
                onEdit={() => setStep(1)}
                status={status === "loading" ? "loading" : status === "error" ? "error" : "idle"}
              />
            )}
          </AnimatePresence>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-14 flex justify-center sm:mt-16"
          >
            <TrustBadge />
          </motion.div>
        </div>
      </section> */}
    </div>
  );
}
