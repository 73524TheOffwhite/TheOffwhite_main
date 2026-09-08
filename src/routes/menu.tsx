import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { ReserveTableLink } from "@/components/ReserveTableLink";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";
import dining from "@/assets/Gemini_Generated_Image_nwgy8znwgy8znwgy.jpg";
// import seabass from "@/assets/dish-seabass.jpg";
// import octopus from "@/assets/dish-octopus.jpg";
// import ravioli from "@/assets/dish-ravioli.jpg";
// import spritz from "@/assets/dish-spritz.jpg";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — The Off White" },
      { name: "description", content: "An illustrated menu of signature plates, with full detail on every dish." },
    ],
  }),
  component: MenuPage,
});

// type Dish = {
//   id: string;
//   name: string;
//   price: string;
//   category: string;
//   image: string;
//   description: string;
//   preparation: string;
//   pairing: string;
//   allergens: string;
// };

// const DISHES: Dish[] = [
//   {
//     id: "sea-bass",
//     name: "Herb Crusted Sea Bass",
//     price: "₹ 1,480",
//     category: "Mains",
//     image: seabass,
//     description: "Wild-caught sea bass cloaked in a Mediterranean herb crust, set over braised fennel with a citrus beurre blanc.",
//     preparation: "Pan-seared skin-side down until crisp, finished in the wood oven on a bed of fennel confit.",
//     pairing: "Sancerre, dry Riesling, or our Garden Gimlet.",
//     allergens: "Fish · Dairy",
//   },
//   {
//     id: "octopus",
//     name: "Grilled Octopus",
//     price: "₹ 880",
//     category: "Starters",
//     image: octopus,
//     description: "Slow-poached Spanish octopus, charred over open flame, with smoked paprika oil and warm chickpea.",
//     preparation: "Poached in court bouillon for 90 minutes, then kissed by the grill for char.",
//     pairing: "Albariño or a Smoked Old Fashioned.",
//     allergens: "Mollusc · Legumes",
//   },
//   {
//     id: "ravioli",
//     name: "Truffle Ravioli",
//     price: "₹ 1,180",
//     category: "Mains",
//     image: ravioli,
//     description: "Hand-folded ravioli filled with wild mushrooms, parmesan, and shaved black truffle, finished in brown butter.",
//     preparation: "Pasta rolled fresh each morning, simmered gently and dressed in foaming truffle butter.",
//     pairing: "Barolo, aged Chardonnay, or a Saffron Negroni.",
//     allergens: "Gluten · Dairy · Egg",
//   },
//   {
//     id: "spritz",
//     name: "Off White Spritz",
//     price: "₹ 620",
//     category: "Cocktails",
//     image: spritz,
//     description: "Our house spritz — elderflower, citrus oils, and prosecco over a single, slow-melting cube.",
//     preparation: "Built over hand-cut ice with fresh citrus expression and a sprig of basil.",
//     pairing: "A perfect aperitif before the burrata or octopus.",
//     allergens: "Sulphites",
//   },
//   {
//     id: "sea-bass-2",
//     name: "Herb Crusted Sea Bass",
//     price: "₹ 1,480",
//     category: "Chef's Picks",
//     image: seabass,
//     description: "A second take on our signature — same crust, served with grilled stone fruit and saffron sauce.",
//     preparation: "Pan-seared and rested under herb butter, plated with a smoked stone-fruit relish.",
//     pairing: "Chenin Blanc, or a Mediterranean Mule.",
//     allergens: "Fish · Dairy",
//   },
//   {
//     id: "octopus-2",
//     name: "Grilled Octopus",
//     price: "₹ 920",
//     category: "Chef's Picks",
//     image: octopus,
//     description: "Charred octopus tossed in a warm potato salad with capers, lemon, and Calabrian chilli oil.",
//     preparation: "Tossed table-warm, dressed in chilli oil and finished with sea salt flakes.",
//     pairing: "Vermentino or a crisp Pilsner.",
//     allergens: "Mollusc",
//   },
//   {
//     id: "ravioli-2",
//     name: "Truffle Ravioli",
//     price: "₹ 1,260",
//     category: "Mains",
//     image: ravioli,
//     description: "Double-stuffed truffle ravioli with aged parmesan cream and a 63° quail egg.",
//     preparation: "Each parcel hand-pleated; the yolk warmed gently to a silken finish.",
//     pairing: "White Burgundy or a Smoked Old Fashioned.",
//     allergens: "Gluten · Dairy · Egg",
//   },
//   {
//     id: "margherita",
//     name: "Wood-Fired Margherita",
//     price: "₹ 720",
//     category: "Mains",
//     image: spritz,
//     description: "San Marzano tomato, fior di latte, fresh basil — 90 seconds at 480°C.",
//     preparation: "Naturally leavened 48-hour dough, fired in our domed wood oven.",
//     pairing: "Chianti Classico or an icy Negroni Sbagliato.",
//     allergens: "Gluten · Dairy",
//   },
// ];

// const CATEGORIES = ["All", "Starters", "Mains", "Cocktails", "Chef's Picks"] as const;



type Dish = {
  id: string;
  name: string;
  image: string;
};

const menuImages = import.meta.glob(
  "/src/assets/menu/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
) as Record<string, string>;

const DISHES: Dish[] = Object.entries(menuImages).map(([path, image]) => {
  const fileName = path.split("/").pop() ?? "";

  const name = fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    id: fileName,
    name,
    image,
  };
});







function MenuPage() {
  // const [active, setActive] = useState<(typeof CATEGORIES)[number]>("All");
  // const [selected, setSelected] = useState<Dish | null>(null);

  // const filtered = active === "All" ? DISHES : DISHES.filter((d) => d.category === active);


  const [selected, setSelected] = useState<Dish | null>(null);

  useEffect(() => {
    if (selected) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [selected]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <PageHero
        eyebrow="The Visual Menu"
        title={<>Made slowly,<br />served generously.</>}
        description="Every plate, photographed and detailed. Tap any dish to read its full story."
        image={dining}
        crumb="Menu"
        imageClassName="object-[62%_center]"
      />

      <section className="bg-[var(--cream)] pt-20 lg:pt-28">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <Reveal className="text-center">
            <Eyebrow>The Selection</Eyebrow>
            <h2 className="heading-section mt-4 text-[clamp(2rem,3.6vw,3rem)] text-[var(--ink)]">Choose your chapter</h2>
            <p className="mt-3 italic text-[var(--ink-muted)] font-serif">The heart of the table</p>
          </Reveal>

          {/* <div className="mt-10 flex flex-wrap justify-center gap-2 sm:gap-3">
            {CATEGORIES.map((c) => {
              const isActive = c === active;
              return (
                <button
                  key={c}
                  onClick={() => setActive(c)}
                  className={`relative px-5 sm:px-7 py-3 text-[11px] uppercase tracking-[0.24em] font-semibold transition-colors ${
                    isActive ? "text-[var(--cream)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="menu-pill"
                      className="absolute inset-0 bg-[var(--cocoa)] rounded-sm"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative">{c}</span>
                </button>
              );
            })}
          </div> */}





        </div>
      </section>

      <section className="bg-[var(--cream)] pt-12 pb-24 lg:pb-32">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
          <motion.div
            layout
            className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-3 lg:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {DISHES.map((d, i) => (
                <motion.button
                  layout
                  key={d.id}
                  onClick={() => setSelected(d)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                  className="group text-left cursor-pointer"
                >
                  <div className="overflow-hidden rounded-lg bg-[var(--cream-warm)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:shadow-[0_30px_60px_-25px_rgba(43,33,24,0.35)] group-hover:scale-[1.02]">
                    <img
                      src={d.image}
                      alt={d.name}
                      loading="lazy"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                    />
                  </div>
                  <div className="mt-5">
                    <h3 className="font-serif text-lg sm:text-xl text-[var(--ink)] leading-snug">{d.name}</h3>
                    {/* <p className="mt-1 text-[13px] text-[var(--cocoa)] tabular-nums">{d.price}</p> */}
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>

          <div className="mt-16 text-center">
            {/* <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-muted)]">All prices in INR, exclusive of taxes</p> */}
            <ReserveTableLink className="btn-primary mt-8">Reserve a Table</ReserveTableLink>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelected(null)}
            role="dialog"
            aria-modal="true"
            aria-label={selected.name}
          >
            <div className="absolute inset-0 bg-black/55 backdrop-blur-md" />

            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="relative w-full max-w-5xl max-h-[92svh] overflow-hidden bg-[var(--cream)] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.55)] rounded-sm"
            >
              {/* Gold filigree border */}
              <div className="pointer-events-none absolute inset-2 sm:inset-3 border border-[var(--gold)]/50" />
              <div className="pointer-events-none absolute inset-3 sm:inset-4 border border-[var(--gold)]/20" />

              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 grid place-items-center w-9 h-9 rounded-full bg-[var(--cream)] text-[var(--ink)] hover:bg-[var(--cocoa)] hover:text-white transition-colors shadow"
              >
                <X size={16} />
              </button>

              <div className="grid md:grid-cols-2 max-h-[92svh] overflow-y-auto">
                <div className="relative bg-[var(--cream-warm)] p-5 sm:p-7">
                  <div className="overflow-hidden rounded-md">
                    <motion.img
                      initial={{ scale: 1.06 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                      src={selected.image}
                      alt={selected.name}
                      className="w-full h-[280px] sm:h-[420px] md:h-full md:max-h-[72svh] object-cover"
                    />
                  </div>
                </div>

                <div className="p-7 sm:p-10 lg:p-12 flex flex-col">
                  {/* <Eyebrow>{selected.category}</Eyebrow> */}
                  <Eyebrow>The Off White</Eyebrow>
                  <h3 className="mt-3 font-serif text-3xl sm:text-4xl text-[var(--ink)] leading-tight">
                    {selected.name}
                  </h3>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="h-px w-10 bg-[var(--gold)]" />
                    {/* <span className="text-[var(--cocoa)] font-medium tabular-nums">{selected.price}</span> */}
                  </div>

                  {/* <p className="mt-6 text-[15px] leading-[1.85] text-[var(--ink-muted)]">{selected.description}</p> */}

                  <div className="mt-7 space-y-5 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--cocoa)] font-semibold"></p>
                      {/* <p className="mt-1.5 text-[var(--ink)]/85 leading-relaxed">{selected.preparation}</p> */}
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--cocoa)] font-semibold"></p>
                      {/* <p className="mt-1.5 text-[var(--ink)]/85 leading-relaxed">{selected.pairing}</p> */}
                    </div>
                    <div className="h-px bg-[var(--border)]" />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--cocoa)] font-semibold"></p>
                      {/* <p className="mt-1.5 text-[var(--ink)]/85 leading-relaxed">{selected.allergens}</p> */}
                    </div>
                  </div>

                  <div className="mt-9">
                    <a
                      href="https://airmenus.in/theoffwhitebarandgrill/order"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setSelected(null)}
                      className="btn-primary"
                    >
                      Place order
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
