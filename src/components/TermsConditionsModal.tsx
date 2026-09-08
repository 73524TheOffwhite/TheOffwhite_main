import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { Eyebrow } from "./Eyebrow";
import { useSiteSettings } from "@/lib/site-settings";

const ease = [0.22, 1, 0.36, 1] as const;

const SECTIONS = [
  {
    title: "Introduction",
    body: 'These Terms and Conditions ("Terms") govern your use of the website of The Off White Bar & Grill ("The Off White", "we", "us", or "our") and your interaction with our online reservation and enquiry services. By accessing or using our website, you agree to these Terms. If you do not agree, please do not use the website.',
  },
  {
    title: "Use of the website",
    body: "You agree to use our website only for lawful purposes and in a way that does not violate applicable law, infringe the rights of others, attempt unauthorised access to our systems, disrupt the website, or submit false or harmful information. We may restrict or terminate access if we believe these Terms have been violated.",
  },
  {
    title: "Website content",
    body: "All content on this website — including text, images, logos, menus, design, photographs, and branding — is owned by or licensed to The Off White unless otherwise stated. You may not copy, reproduce, distribute, modify, or use our content for commercial purposes without our prior written permission. Information on the website is provided for general information only. We reserve the right to update or change content at any time without notice.",
  },
  {
    title: "Reservations and enquiries",
    body: "Online reservation submissions are requests, not confirmed bookings, unless we explicitly confirm them. Confirmation may be sent by phone, email, WhatsApp, or other agreed method. You are responsible for providing accurate contact and booking details. Event and private enquiries are subject to availability, venue policies, and separate confirmation by our team. We reserve the right to accept or decline any reservation or enquiry, modify arrangements due to operational needs, or cancel or reschedule in exceptional circumstances. We will make reasonable efforts to notify you if your booking is affected.",
  },
  {
    title: "Guest responsibilities",
    body: "When visiting The Off White or using our services, you agree to provide accurate information, arrive on time for confirmed reservations, follow restaurant policies and house rules, treat staff and guests with respect, and comply with applicable laws including those relating to alcohol consumption where relevant. We reserve the right to refuse service or entry in accordance with applicable law and our house policies.",
  },
  {
    title: "Pricing, menus, and offers",
    body: "Menu items, prices, availability, and promotions may change without notice. Final pricing and availability are confirmed at the restaurant at the time of service unless otherwise agreed in writing for a confirmed event booking. Taxes, service charges, or additional fees apply as per our policies and applicable law.",
  },
  {
    title: "Third-party services and links",
    body: "Our website may include links or integrations with third-party services including Google Maps, Google Reviews, Instagram, and WhatsApp. These services are governed by their own terms and policies. We are not responsible for third-party websites, content, or services.",
  },
  {
    title: "Disclaimer",
    body: 'The website is provided on an "as is" and "as available" basis. To the fullest extent permitted by law, we do not guarantee that the website will be uninterrupted, error-free, always complete or accurate, or free from viruses or harmful components. Your use of the website is at your own risk.',
  },
  {
    title: "Limitation of liability",
    body: "To the maximum extent permitted by applicable law, The Off White Bar & Grill and its owners, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the website, reliance on website content, reservation or enquiry submissions, or third-party services linked from the website. Nothing in these Terms excludes liability that cannot be excluded or limited under applicable law.",
  },
  {
    title: "Indemnity",
    body: "You agree to indemnify and hold harmless The Off White Bar & Grill from any claims, losses, or expenses arising from your misuse of the website or breach of these Terms.",
  },
  {
    title: "Privacy",
    body: "Your use of the website is also governed by our Privacy Policy, which explains how we collect and use personal information. By using the website, you acknowledge that you have read our Privacy Policy.",
  },
  {
    title: "Intellectual property",
    body: '"The Off White", "The Off White Bar & Grill", and related branding, logos, and content are protected by applicable intellectual property laws. Unauthorised use is prohibited.',
  },
  {
    title: "Governing law and jurisdiction",
    body: "These Terms are governed by the laws of India. Any disputes arising from or relating to these Terms or use of the website shall be subject to the exclusive jurisdiction of the courts at Goa, India, unless otherwise required by applicable law.",
  },
  {
    title: "Changes to these Terms",
    body: 'We may update these Terms from time to time. The updated version will be posted on the website with a revised "Last updated" date. Continued use of the website after changes are posted constitutes acceptance of the updated Terms.',
  },
  {
    title: "Contact us",
    body: "For questions about these Terms, contact The Off White Bar & Grill at info@theoffwhite.com, +91 87678 11778, or at our address: Sitara Atrium, 4th Floor, Sitara Building, Colmorod, Navelim Highway, Sanscar Society, Madgaon, Navelim, Goa, India.",
  },
] as const;

type TermsConditionsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TermsConditionsModal({ open, onOpenChange }: TermsConditionsModalProps) {
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
          <motion.button
            type="button"
            aria-label="Close terms and conditions"
            className="absolute inset-0 bg-[var(--ink)]/45 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.35 }}
            onClick={() => onOpenChange(false)}
          />

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
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#EFE3D1]/80 to-transparent"
            />

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
                  className="heading-section mt-3 text-[2.15rem] leading-none text-[var(--ink)] sm:text-[2.55rem]"
                >
                  Terms &amp; Conditions
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
