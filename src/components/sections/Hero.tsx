import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { ReserveTableLink } from "@/components/ReserveTableLink";
import { useHomepageCms } from "@/lib/homepage-cms";
import { cmsSrc } from "@/lib/cms-src";

function headlineLines(headline: string) {
  const parts = headline.split(/\s*\/\s*|\n/).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return parts;
  // Keep the original visual break when CMS still has the default phrasing.
  if (/meets cuisine/i.test(headline)) {
    return ["Where Architecture", "Meets Cuisine"];
  }
  return [headline];
}

export function Hero() {
  const { data, isPending } = useHomepageCms();
  const eyebrow = data?.hero.eyebrow || "Fine Dining · Crafted Cocktails · Mediterranean Soul";
  const headline = data?.hero.headline || "Where Architecture / Meets Cuisine";
  const lines = headlineLines(headline);
  const imageSrc = cmsSrc(isPending, data?.hero.imageUrl, heroImg);
  const button1 = data?.hero.button1 || { label: "Reserve a Table", href: "/events" };
  const button2 = data?.hero.button2 || { label: "View Menu", href: "#menu" };
  const scrollLabel = data?.hero.scrollLabel || "Scroll Down";
  const scrollHref = data?.hero.scrollHref || "#story";

  return (
    <section className="relative h-[100svh] min-h-[560px] sm:min-h-[640px] lg:min-h-[720px] w-full overflow-hidden">
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        {imageSrc ? (
        <img
          src={imageSrc}
          alt="The Off White restaurant interior"
          className="h-full w-full object-cover"
          width={1920}
          height={1280}
          fetchPriority="high"
          decoding="async"
        />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/55" />
      </motion.div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="text-[11px] uppercase tracking-[0.32em] font-medium text-white/90"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-6 heading-hero text-[clamp(2.8rem,7vw,6rem)] leading-[1.05] max-w-5xl"
        >
          {lines.map((line, i) => (
            <span key={`${line}-${i}`}>
              {i > 0 ? <br /> : null}
              {line}
            </span>
          ))}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          {button1.href === "/events" || button1.href.includes("reserve") || button1.href.includes("events") ? (
            <ReserveTableLink className="inline-flex items-center px-7 py-3.5 bg-[var(--cream)] text-[var(--ink)] text-xs uppercase tracking-[0.22em] font-semibold transition-transform hover:scale-[1.02]">
              {button1.label}
            </ReserveTableLink>
          ) : (
            <a
              href={button1.href}
              className="inline-flex items-center px-7 py-3.5 bg-[var(--cream)] text-[var(--ink)] text-xs uppercase tracking-[0.22em] font-semibold transition-transform hover:scale-[1.02]"
            >
              {button1.label}
            </a>
          )}
          <a href={button2.href} className="btn-ghost-light">
            {button2.label}
          </a>
        </motion.div>
      </div>

      <motion.a
        href={scrollHref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ delay: 1.6, duration: 2, repeat: Infinity, repeatType: "loop" }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-white/90 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">{scrollLabel}</span>
        <ChevronDown size={18} />
      </motion.a>
    </section>
  );
}
