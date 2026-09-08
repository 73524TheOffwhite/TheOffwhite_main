import { motion, useReducedMotion } from "framer-motion";
import { useSiteSettings } from "@/lib/site-settings";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.11.549 4.09 1.51 5.81L0 24l6.35-1.66A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.82a9.82 9.82 0 0 1-5.01-1.37l-.36-.214-3.76.98 1.004-3.66-.235-.374A9.82 9.82 0 0 1 2.18 12C2.18 6.57 6.57 2.18 12 2.18S21.82 6.57 21.82 12 17.43 21.82 12 21.82z" />
    </svg>
  );
}

export function WhatsAppFloat() {
  const reduceMotion = useReducedMotion();
  const settings = useSiteSettings();
  const whatsappUrl =
    `https://wa.me/${settings.whatsapp_number}?text=` +
    encodeURIComponent(settings.whatsapp_message_template);

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-40 safe-pb safe-pr"
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
        whileHover={reduceMotion ? undefined : { scale: 1.05, y: -1 }}
        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <WhatsAppIcon className="h-7 w-7 transition-transform duration-300 group-hover:scale-105" />

        <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-md bg-[var(--ink)] px-3 py-1.5 text-xs text-[var(--cream)] opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 md:block">
          Chat on WhatsApp
        </span>
      </motion.a>
    </motion.div>
  );
}
