import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { ReserveTableLink } from "@/components/ReserveTableLink";

type NavItem = { label: string; to: string; sub?: string };

const NAV: NavItem[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Menu", to: "/menu" },
  { label: "The Space", to: "/the-space" },
  { label: "Gallery", to: "/gallery" },
  { label: "Reservations", to: "/events" },
  { label: "Level 4", to: "/level-4-dining", sub: "Fine Dining & Bar" },
  { label: "Level 5", to: "/level-5-events", sub: "Events & Parties" },
  { label: "Contact", to: "/contact" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isHome = pathname === "/";
  // Non-home pages always use the solid header so text is readable
  const solid = scrolled || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        solid ? "bg-black/30 backdrop-blur-md shadow-[0_1px_0_rgba(255,255,255,0.08)]" : "bg-transparent"
      }`}
    >
      <div className="safe-pt safe-pl safe-pr mx-auto flex max-w-[1400px] items-center justify-between px-5 sm:px-6 lg:px-10 py-1 sm:py-1">
        <Link to="/" aria-label="The Off White — Home" className="flex shrink-0 items-center">
          <Logo light className="h-[5.5rem] sm:h-24" />
        </Link>

        <nav className="hidden lg:flex items-end gap-9">
          {NAV.map((item) => {
            const sub = item.sub;
            return (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: true }}
                className="group relative flex flex-col leading-tight transition-colors text-white/90 hover:text-white"
                activeProps={{
                  className: "text-white [&_span.bar]:w-full",
                }}
              >
                <span className="text-[13px] font-medium tracking-wide">{item.label}</span>
                {sub && (
                  <span className="mt-0.5 text-[9px] uppercase tracking-[0.22em] font-medium text-white/65">
                    {sub}
                  </span>
                )}
                <span className="bar absolute -bottom-1 left-0 h-px w-0 bg-current transition-all duration-300 group-hover:w-full" />
              </Link>
            );
          })}
        </nav>

        <ReserveTableLink className="hidden lg:inline-flex items-center px-5 py-3 border text-[11px] uppercase tracking-[0.24em] font-semibold transition-colors border-white/80 text-white hover:bg-white hover:text-[var(--ink)]">
          Reserve a Table
        </ReserveTableLink>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 text-white"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:hidden bg-black/65 backdrop-blur-md border-t border-white/10 px-6 py-6 flex flex-col gap-4"
        >
          {NAV.map((item) => {
            const sub = item.sub;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="text-white/90 text-sm font-medium flex flex-col leading-tight"
                activeProps={{ className: "text-white text-sm font-semibold flex flex-col leading-tight" }}
              >
                <span>{item.label}</span>
                {sub && (
                  <span className="mt-0.5 text-[9px] uppercase tracking-[0.22em] text-white/65">{sub}</span>
                )}
              </Link>
            );
          })}
          <ReserveTableLink className="btn-primary mt-2">
            Reserve a Table
          </ReserveTableLink>
        </motion.div>
      )}
    </motion.header>
  );
}
