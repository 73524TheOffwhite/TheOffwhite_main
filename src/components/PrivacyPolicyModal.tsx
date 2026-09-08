import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Eyebrow } from "./Eyebrow";
import { useSiteSettings } from "@/lib/site-settings";

const ease = [0.22, 1, 0.36, 1] as const;

const SECTIONS = [
  {
    title: "Introduction",
    body: 'The Off White Bar & Grill ("The Off White", "we", "us", or "our") respects your privacy. This Privacy Policy explains how we collect, use, store, and protect personal information when you visit our website, make a reservation, submit an enquiry, contact us, or interact with us online. By using our website or submitting your information to us, you agree to this Privacy Policy.',
  },
  {
    title: "Information we collect",
    body: "We may collect the following types of information: Information you provide directly — name, phone number, email address, reservation details (date, time, number of guests, occasion, special requests), event or private enquiry details, messages sent through contact forms or WhatsApp, and any other information you choose to share. Information collected automatically — IP address, browser type, device information, pages visited, time spent on the site, referring website, and general location (city or region level). Information from third-party services — our website may use Google Maps, Google Reviews, Instagram, and WhatsApp. These services may collect information according to their own privacy policies.",
  },
  {
    title: "How we use your information",
    body: "We use personal information to process reservations and enquiries, respond to questions, confirm and manage bookings, communicate by phone, email, or WhatsApp, improve our website and guest experience, maintain security, comply with legal requirements, and send service-related messages. We do not sell your personal information. We will only use your information for marketing if you have given clear consent, and you may opt out at any time.",
  },
  {
    title: "Legal basis for processing",
    body: "Depending on the situation, we process your information because it is necessary to respond to your request or booking, you have given consent, it is in our legitimate business interests (such as improving services and website security), or it is required by law.",
  },
  {
    title: "How we share information",
    body: "We may share your information only when necessary with our staff, technology and hosting providers, communication tools (email or WhatsApp), and legal or regulatory authorities when required by law. We require service providers to handle information responsibly and only for specified purposes.",
  },
  {
    title: "Cookies and similar technologies",
    body: "Our website may use cookies and similar technologies to keep the site functioning, remember preferences, understand how visitors use the site, and improve performance. You can control cookies through your browser settings. Some parts of the website may not work properly if cookies are disabled.",
  },
  {
    title: "Data retention",
    body: "We keep personal information only for as long as needed to fulfil the purpose for which it was collected, manage reservations and guest communication, and meet legal or operational requirements. When no longer required, we delete or anonymise information where reasonably possible.",
  },
  {
    title: "Data security",
    body: "We take reasonable technical and organisational measures to protect personal information against unauthorised access, loss, misuse, or alteration. However, no method of transmission over the internet is completely secure, and we cannot guarantee absolute security.",
  },
  {
    title: "Your rights",
    body: "Subject to applicable law (including India's Digital Personal Data Protection Act, 2023, where applicable), you may have the right to request access, correction, or deletion of your information, withdraw consent, object to or restrict certain processing, and lodge a complaint with the relevant authority. To exercise these rights, email info@theoffwhite.com. We may need to verify your identity before responding.",
  },
  {
    title: "Children's privacy",
    body: "Our website and services are not directed at children under 18. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will take appropriate steps to delete it.",
  },
  {
    title: "Third-party links and services",
    body: "Our website may contain links to third-party websites or services including Instagram, Google, and WhatsApp. We are not responsible for the privacy practices of those third parties. We encourage you to read their privacy policies before using their services.",
  },
  {
    title: "International transfers",
    body: "Your information may be processed or stored using service providers located outside India. Where this occurs, we take reasonable steps to ensure appropriate safeguards are in place, consistent with applicable law.",
  },
  {
    title: "Changes to this Privacy Policy",
    body: 'We may update this Privacy Policy from time to time. The "Last updated" date at the top reflects the latest version. Continued use of our website after changes are posted means you accept the updated policy.',
  },
  {
    title: "Contact us",
    body: "For privacy-related questions or requests, contact The Off White Bar & Grill at info@theoffwhite.com, +91 87678 11778, or at our address: Sitara Atrium, 4th Floor, Sitara Building, Colmorod, Navelim Highway, Sanscar Society, Madgaon, Navelim, Goa, India.",
  },
] as const;

type PrivacyPolicyModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PrivacyPolicyModal({ open, onOpenChange }: PrivacyPolicyModalProps) {
  const settings = useSiteSettings();
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKeyDown);

    const t = window.setTimeout(() => closeRef.current?.focus(), 80);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(t);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6 md:p-10"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.4, ease }}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close privacy policy"
            className="absolute inset-0 bg-[var(--ink)]/45 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.35 }}
            onClick={() => onOpenChange(false)}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative z-10 flex max-h-[92dvh] w-full max-w-[640px] flex-col overflow-hidden rounded-t-2xl border border-[var(--border)] bg-[#FAF8F5] shadow-[0_24px_80px_-20px_rgba(43,33,24,0.35)] sm:rounded-2xl"
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 48, scale: 0.97 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 28, scale: 0.98 }
            }
            transition={{ duration: reduceMotion ? 0.2 : 0.55, ease }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Soft top wash */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#EFE3D1]/80 to-transparent"
            />

            {/* Header */}
            <div className="relative flex items-start justify-between gap-4 border-b border-[var(--border)]/70 px-6 pb-5 pt-7 sm:px-9 sm:pt-8">
              <motion.div
                className="min-w-0"
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.5, ease }}
              >
                <Eyebrow>Legal</Eyebrow>
                <h2
                  id={titleId}
                  className="heading-section mt-3 text-[2.35rem] leading-none text-[var(--ink)] sm:text-[2.75rem]"
                >
                  Privacy Policy
                </h2>
                <p className="mt-2 text-xs tracking-wide text-[var(--ink-muted)]">
                  {settings.brand_name} · Last updated 22 August 2026
                </p>
              </motion.div>

              <motion.button
                ref={closeRef}
                type="button"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
                className="group relative mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border)] bg-white/60 text-[var(--ink)] transition-colors duration-300 hover:border-[var(--cocoa)] hover:bg-[var(--cream)] hover:text-[var(--cocoa)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50"
                initial={reduceMotion ? false : { opacity: 0, rotate: -30, scale: 0.9 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ delay: 0.12, duration: 0.45, ease }}
                whileHover={reduceMotion ? undefined : { scale: 1.05 }}
                whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              >
                <X
                  size={18}
                  strokeWidth={1.5}
                  className="transition-transform duration-300 group-hover:rotate-90"
                />
              </motion.button>
            </div>

            {/* Scrollable body */}
            <div
              ref={scrollRef}
              className="relative flex-1 overflow-y-auto overscroll-contain px-6 py-7 sm:px-9 sm:py-8"
            >
              <motion.div
                className="space-y-8"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: reduceMotion ? 0 : 0.055,
                      delayChildren: reduceMotion ? 0 : 0.12,
                    },
                  },
                }}
              >
                {SECTIONS.map((section, i) => (
                  <motion.section
                    key={section.title}
                    variants={{
                      hidden: reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, y: 16 },
                      show: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.45, ease },
                      },
                    }}
                  >
                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-sm text-[var(--gold)] tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-serif text-xl text-[var(--ink)] sm:text-[1.35rem]">
                        {section.title}
                      </h3>
                    </div>
                    <p className="mt-2.5 pl-8 text-sm leading-relaxed text-[var(--ink-muted)] sm:text-[0.9375rem]">
                      {section.body}
                    </p>
                    {i < SECTIONS.length - 1 && (
                      <div
                        aria-hidden
                        className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent"
                      />
                    )}
                  </motion.section>
                ))}
              </motion.div>
            </div>

            {/* Footer actions */}
            <motion.div
              className="relative border-t border-[var(--border)]/70 bg-[#F7F2EB]/90 px-6 py-4 backdrop-blur-sm sm:px-9"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease }}
            >
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="btn-primary w-full sm:w-auto sm:min-w-[180px]"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
