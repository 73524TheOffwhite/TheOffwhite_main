import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Reveal } from "../Reveal";
import { Eyebrow } from "../Eyebrow";
import { useHomepageCms } from "@/lib/homepage-cms";

const RESERVATION_WHATSAPP = "918767811778";

function buildReservationWhatsAppUrl(data: { name: string; phone: string }) {
  const lines = [
    "Hi, I'd like to reserve a table at The Off White.",
    "",
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
  ];
  return `https://wa.me/${RESERVATION_WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`;
}

const fallbackMenuCols = [
  { title: "Starters", items: ["Burrata & Heirloom Tomatoes", "Tuna Tartare", "Truffle Arancini"] },
  { title: "Mains", items: ["Lemon Herb Chicken", "Seafood Linguine", "Grilled Lamb Cutlets"] },
  { title: "Desserts", items: ["Tiramisu", "Chocolate Delice", "Pistachio Semifreddo"] },
];

function Vase({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 320" fill="none">
      <g stroke="#8B5B2A" strokeWidth="0.8" opacity="0.55">
        <path d="M100 30 C 95 80 90 130 95 200" />
        <path d="M100 30 C 80 60 60 100 50 140" />
        <path d="M100 30 C 120 70 135 120 145 160" />
        <path d="M70 90 C 65 95 60 100 55 110 M 130 90 C 135 95 140 100 145 110" />
        <ellipse cx="60" cy="80" rx="8" ry="3" transform="rotate(-30 60 80)" />
        <ellipse cx="140" cy="80" rx="8" ry="3" transform="rotate(30 140 80)" />
        <ellipse cx="80" cy="50" rx="7" ry="3" transform="rotate(-20 80 50)" />
        <ellipse cx="120" cy="50" rx="7" ry="3" transform="rotate(20 120 50)" />
      </g>
      <path d="M70 200 Q 100 195 130 200 L 140 290 Q 100 305 60 290 Z" fill="#E8DCC9" stroke="#B88A52" strokeWidth="0.8" />
      <ellipse cx="100" cy="200" rx="30" ry="5" fill="#D9CCBC" />
    </svg>
  );
}

export function MenuAndReserve() {
  const { data } = useHomepageCms();
  const menu = data?.menuPreview;
  const menuCols =
    menu?.columns?.length
      ? menu.columns.map((c) => ({ title: c.title, items: c.items }))
      : fallbackMenuCols;
  const menuEyebrow = menu?.eyebrow || "Menu Preview";
  const menuHeadline = menu?.headline || "A Taste of What Awaits";
  const menuButton = menu?.button || { label: "Explore Full Menu", href: "/menu" };
  const reservationEyebrow = menu?.reservation.eyebrow || "Reservation";
  const reservationHeadline = menu?.reservation.headline || "Book Your Table";
  const submitLabel = menu?.reservation.submitLabel || "Reserve Your Table";

  return (
    <section id="reserve" className="relative bg-[var(--cream)] pb-0">
      <div className="bg-[var(--cream-warm)]">
        <div className="mx-auto grid max-w-[1400px] grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 px-6 lg:px-10 py-20 lg:py-28 relative">
          <Vase className="absolute left-0 bottom-4 w-28 lg:w-40 hidden md:block" />
          <Vase className="absolute right-2 bottom-4 w-24 lg:w-32 hidden md:block" />

          <Reveal className="relative z-10 lg:pl-32">
            <Eyebrow>{menuEyebrow}</Eyebrow>
            <h2 className="heading-section mt-4 text-[clamp(1.8rem,3vw,2.8rem)] text-[var(--ink)]">{menuHeadline}</h2>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
              {menuCols.map((c) => (
                <div key={c.title}>
                  <h4 className="text-[11px] uppercase tracking-[0.22em] font-semibold text-[var(--ink)]">{c.title}</h4>
                  <ul className="mt-4 space-y-3 text-[var(--ink-muted)]">
                    {c.items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <Link to={menuButton.href.startsWith("/") ? menuButton.href : "/menu"} className="btn-outline mt-10">
              {menuButton.label}
            </Link>
          </Reveal>

          <Reveal delay={0.15} className="relative z-10 lg:pr-24 lg:flex lg:items-center">
            <div className="w-full bg-[#EFE3D1] arch-top px-7 lg:px-10 py-10 lg:py-12 shadow-[0_30px_80px_-40px_rgba(43,33,24,0.45)]">
              <div className="text-center">
                <Eyebrow>{reservationEyebrow}</Eyebrow>
                <h2 className="heading-section mt-3 text-[clamp(1.8rem,3vw,2.6rem)] text-[var(--ink)]">{reservationHeadline}</h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[var(--ink-muted)]">
                  Share your name and number — we’ll continue your booking on WhatsApp.
                </p>
              </div>
              <ReservationForm submitLabel={submitLabel} />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ReservationForm({ submitLabel }: { submitLabel: string }) {
  const [data, setData] = useState({ name: "", phone: "" });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const setName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z\s'.-]/g, "").slice(0, 60);
    setData((d) => ({ ...d, name: value }));
    if (errors.name) setErrors((err) => ({ ...err, name: undefined }));
  };

  const setPhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setData((d) => ({ ...d, phone: value }));
    if (errors.phone) setErrors((err) => ({ ...err, phone: undefined }));
  };

  const validate = () => {
    const next: { name?: string; phone?: string } = {};
    const name = data.name.trim();

    if (!name) next.name = "Please enter your name.";
    else if (name.length < 2) next.name = "Name must be at least 2 characters.";
    else if (!/^[a-zA-Z][a-zA-Z\s'.-]*$/.test(name)) next.name = "Please enter a valid name.";

    if (!data.phone) next.phone = "Please enter your phone number.";
    else if (data.phone.length !== 10) next.phone = "Enter a valid 10-digit phone number.";

    setErrors(next);
    return !next.name && !next.phone;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    window.open(
      buildReservationWhatsAppUrl({ name: data.name.trim(), phone: data.phone }),
      "_blank",
      "noopener,noreferrer",
    );
  };

  const inputCls =
    "w-full bg-white/70 border px-4 py-3.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)]/80 outline-none transition-colors";
  const fieldCls = (hasError: boolean) =>
    `${inputCls} ${hasError ? "border-[var(--cocoa-dark)] focus:border-[var(--cocoa-dark)]" : "border-[var(--border)] focus:border-[var(--cocoa)]"}`;

  return (
    <form onSubmit={submit} className="mx-auto mt-8 max-w-md space-y-4" noValidate>
      <div>
        <input
          className={fieldCls(Boolean(errors.name))}
          placeholder="Your Name"
          value={data.name}
          onChange={setName}
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "reserve-name-error" : undefined}
        />
        {errors.name && (
          <p id="reserve-name-error" className="mt-1.5 text-sm text-[var(--cocoa-dark)]">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <input
          className={fieldCls(Boolean(errors.phone))}
          placeholder="Phone Number"
          value={data.phone}
          onChange={setPhone}
          autoComplete="tel"
          inputMode="numeric"
          maxLength={10}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "reserve-phone-error" : undefined}
        />
        {errors.phone && (
          <p id="reserve-phone-error" className="mt-1.5 text-sm text-[var(--cocoa-dark)]">
            {errors.phone}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-[var(--cocoa)] hover:bg-[var(--cocoa-dark)] text-white py-4 text-xs uppercase tracking-[0.28em] font-semibold transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  );
}
