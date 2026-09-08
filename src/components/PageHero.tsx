import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Eyebrow } from "./Eyebrow";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  crumb,
  imageClassName,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  image?: string;
  crumb: string;
  imageClassName?: string;
}) {
  return (
    <section className="relative h-[78svh] min-h-[460px] sm:min-h-[520px] lg:min-h-[600px] w-full overflow-hidden">
      <motion.div
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0"
      >
        {image ? (
          <img
            src={image}
            alt=""
            className={cn(
              "absolute inset-0 h-full w-full max-w-none object-cover object-center",
              imageClassName,
            )}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/65" />
      </motion.div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
        >
          <Eyebrow>{eyebrow}</Eyebrow>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 heading-hero text-[clamp(2.4rem,5.6vw,4.6rem)] leading-[1.05] max-w-4xl"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="mt-6 max-w-2xl text-[15px] text-white/85 leading-[1.85]"
          >
            {description}
          </motion.p>
        )}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/80 flex items-center gap-3"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <span aria-hidden>/</span>
          <span className="text-white">{crumb}</span>
        </motion.nav>
      </div>
    </section>
  );
}
