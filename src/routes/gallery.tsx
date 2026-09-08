import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { Reveal } from "@/components/Reveal";
// Hidden for now — restore with the 360° gallery tab:
// import { VirtualTour360, type VirtualTourScene } from "@/components/VirtualTour360";
import {
  DEFAULT_FILTERS,
  useGalleryCms,
  type GalleryCat,
  // type GalleryCmsTourScene,
} from "@/lib/gallery-cms";
import { startSlowImagePreload } from "@/lib/slow-image-preload";
import archway from "@/assets/space-archway.jpg";
import bar from "@/assets/space-bar.jpg";
import mural from "@/assets/space-mural.jpg";
import dining from "@/assets/space-dining.jpg";
// import niche from "@/assets/niche.jpg";
// import storyArch from "@/assets/story-arch.jpg";
import seabass from "@/assets/dish-seabass.jpg";
import octopus from "@/assets/dish-octopus.jpg";
import ravioli from "@/assets/dish-ravioli.jpg";
import spritz from "@/assets/dish-spritz.jpg";
import spaceHero from "@/assets/space-hero.jpg";
import kitchenBar from "@/assets/kitchen-bar-level4.jpg";
import spaceLevel5 from "@/assets/space-level5.jpg";
import philosophyDining from "@/assets/philosophy-dining.jpg";
import vegSalad from "@/assets/dish-veg-salad.jpg";
import beefFillet from "@/assets/dish-beef-fillet.jpg";
import porkRoast from "@/assets/dish-pork-roast.jpg";
import chickenRollatini from "@/assets/dish-chicken-rollatini.jpg";
import caramelCustard from "@/assets/dish-caramel-custard.jpg";
import bourbonBeef from "@/assets/dish-bourbon-beef.jpg";
import muttonCurry from "@/assets/dish-mutton-curry.jpg";
import prawnsScampi from "@/assets/dish-prawns-scampi.jpg";
import chocolateMousse from "@/assets/dish-chocolate-mousse.jpg";
import muttonDumPhukt from "@/assets/dish-mutton-dum-phukt.jpg";
import chickenBiryani from "@/assets/dish-chicken-biryani.jpg";
import muttonPakora from "@/assets/dish-mutton-pakora.jpg";
import redWineSangria from "@/assets/dish-red-wine-sangria.jpg";
import chickenGheeRoast from "@/assets/dish-chicken-ghee-roast.jpg";
import muttonNalupu from "@/assets/dish-mutton-nalupu.jpg";
import seafoodPaella from "@/assets/dish-seafood-paella.jpg";
import spaghetti from "@/assets/dish-spaghetti.jpg";
import prawnsCrabBiryani from "@/assets/dish-prawns-crab-biryani.jpg";
import kholapuriMutton from "@/assets/dish-kholapuri-mutton.jpg";
import desiMuttonCurry from "@/assets/dish-desi-mutton-curry.jpg";
import galleryEventsToast from "@/assets/gallery-events-toast.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — The Off White" },
      { name: "description", content: "Moments, captured. A visual diary of light, plates and quiet corners at The Off White." },
      { property: "og:title", content: "Gallery — The Off White" },
      { property: "og:description", content: "Moments, captured." },
    ],
  }),
  component: GalleryPage,
});

const ease = [0.22, 1, 0.36, 1] as const;

type Cat = GalleryCat;

const filters: { key: Cat; label: string }[] = DEFAULT_FILTERS;

type GalleryItem = { id?: string; src: string; cat: Exclude<Cat, "All">; label: string };

const offwhiteModules = import.meta.glob("../offwhite images/*.{jpg,JPG,jpeg,JPEG,png,PNG}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

function offwhiteLabel(path: string) {
  const raw = path.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "Photo";
  return raw.replace(/\s*-\s*Copy$/i, "").replace(/_/g, " ");
}

function offwhiteCategory(filename: string): Exclude<Cat, "All"> {
  const name = filename.toLowerCase();

  if (
    /^(food|dessert|drinks?\d|offwhite_food|offwhite_foods|offwhite_drinks)/.test(name) ||
    name.startsWith("food") ||
    name.includes("dessert") ||
    /^(dining3|dining_img|offwhite_dining3)/.test(name)
  ) {
    return "Food";
  }

  if (/^screenshot 2026-06-15 184/.test(name) || /^screenshot 2026-06-16 133/.test(name)) {
    return "Level 5";
  }

  if (/^screenshot/.test(name) || /^dining/.test(name)) {
    return "Level 4";
  }

  return "Level 4";
}

const offwhiteItems: GalleryItem[] = Object.entries(offwhiteModules).map(([path, src]) => {
  const filename = path.split("/").pop() ?? "";
  return {
    src,
    cat: offwhiteCategory(filename),
    label: offwhiteLabel(path),
  };
});

const baseItems: GalleryItem[] = [
  { src: dining, cat: "Level 4", label: "Sunlit dining" },
  { src: chickenBiryani, cat: "Food", label: "Hyderabadi chicken biryani" },
  { src: mural, cat: "Level 5", label: "Mural seating" },
  { src: prawnsScampi, cat: "Food", label: "Slow cooked prawns" },

  { src: spaceHero, cat: "Events", label: "Evening ambience" },
  { src: caramelCustard, cat: "Food", label: "Dense caramel custard" },
  { src: archway, cat: "Level 5", label: "Archway corner" },
  { src: beefFillet, cat: "Food", label: "Tender beef fillet" },

  { src: kitchenBar, cat: "Level 4", label: "Kitchen & bar" },
  { src: chocolateMousse, cat: "Food", label: "Orange chocolate mousse" },
  { src: spaceLevel5, cat: "Level 5", label: "Level 5 lounge" },
  { src: vegSalad, cat: "Food", label: "Off White veg special salad" },

  { src: bar, cat: "Level 4", label: "The bar" },
  { src: muttonDumPhukt, cat: "Food", label: "Mutton dum phukt" },
  { src: philosophyDining, cat: "Level 4", label: "Philosophy of dining" },
  { src: redWineSangria, cat: "Food", label: "Red wine sangria" },

  { src: galleryEventsToast, cat: "Events", label: "A toast to remember" },
  { src: chickenGheeRoast, cat: "Food", label: "Chicken ghee roast" },
  // 360° gallery items — restore with the 360° tab:
  // { src: niche, cat: "360 View", label: "The niche" },
  { src: seafoodPaella, cat: "Food", label: "Chicken & seafood paella" },

  // { src: storyArch, cat: "360 View", label: "Mediterranean arch" },
  { src: prawnsCrabBiryani, cat: "Food", label: "Prawns & crab biryani" },
  // { src: dining, cat: "360 View", label: "Dining room panorama" },
  { src: porkRoast, cat: "Food", label: "Pork roast in red wine" },

  { src: seabass, cat: "Food", label: "Sea bass" },
  { src: bar, cat: "Events", label: "Cocktail hour" },
  { src: muttonNalupu, cat: "Food", label: "Mutton nalupu" },
  { src: chickenRollatini, cat: "Food", label: "Chicken rollatini" },

  { src: bourbonBeef, cat: "Food", label: "Bourbon peach glazed beef" },
  { src: ravioli, cat: "Food", label: "Truffle ravioli" },
  { src: muttonPakora, cat: "Food", label: "Mutton pakora" },
  { src: octopus, cat: "Food", label: "Grilled octopus" },

  { src: muttonCurry, cat: "Food", label: "Desi mutton curry" },
  { src: spritz, cat: "Food", label: "Off White spritz" },
  { src: spaghetti, cat: "Food", label: "Spaghetti in red sauce" },
  { src: kholapuriMutton, cat: "Food", label: "Kholapuri mutton lonche" },

  { src: desiMuttonCurry, cat: "Food", label: "Mutton curry & rice" },
];

const fallbackItems: GalleryItem[] = [...baseItems, ...offwhiteItems];

const previewImagesByCategory: Partial<Record<Cat, string[]>> = {
  All: [
    "ChatGPT Image Jun 19, 2026, 04_48_31 PM.jpg",
    "ChatGPT Image Jun 19, 2026, 04_50_13 PM.jpg",
    "ChatGPT Image Jun 19, 2026, 04_54_03 PM.jpg",
    "ChatGPT Image Jun 19, 2026, 05_00_41 PM.jpg",
  ],
  "Level 4": [
    "ChatGPT Image Jun 19, 2026, 05_42_45 PM.jpg",
    "ChatGPT Image Jun 19, 2026, 04_52_45 PM.jpg",
    "ChatGPT Image Jun 19, 2026, 05_29_19 PM.jpg",
    "ChatGPT Image Jun 19, 2026, 04_49_41 PM.jpg",
  ],
  "Level 5": [
    "ChatGPT Image Jun 19, 2026, 05_51_14 PM.jpg",
    "ChatGPT Image Jun 19, 2026, 05_52_56 PM.jpg",
    "ChatGPT Image Jun 19, 2026, 05_52_45 PM.jpg",
    "ChatGPT Image Jun 19, 2026, 05_54_21 PM.jpg",
  ],
  Food: [
    "ChatGPT Image Jun 19, 2026, 05_56_25 PM.jpg",
    "ChatGPT Image Jun 19, 2026, 05_57_47 PM.jpg",
    "ChatGPT Image Jun 19, 2026, 05_58_48 PM.jpg",
    "ChatGPT Image Jun 19, 2026, 05_59_45 PM.jpg",
  ],
  Events: [
    "ChatGPT Image Jun 19, 2026, 06_02_29 PM.jpg",
    "image (1).jpg",
    "image (2).jpg",
    "image (3).jpg",
  ],
};

function offwhiteItemByFilename(filename: string): GalleryItem {
  const match = Object.entries(offwhiteModules).find(([path]) => {
    const file = path.split("/").pop() ?? "";
    return file.toLowerCase() === filename.toLowerCase();
  });

  if (!match) {
    return { src: "", cat: "Food", label: filename.replace(/\.[^.]+$/, "") };
  }

  const [path, src] = match;
  const file = path.split("/").pop() ?? "";
  return {
    src,
    cat: offwhiteCategory(file),
    label: offwhiteLabel(path),
  };
}

// Hidden for now — restore with the 360° gallery tab:
// function cmsTourToVirtualScenes(scenes: GalleryCmsTourScene[]): VirtualTourScene[] {
//   return scenes.map((scene) => ({
//     id: scene.id,
//     name: scene.name,
//     label: scene.label,
//     panorama: scene.panorama,
//     thumbnail: scene.thumbnail,
//     links: scene.hotspots.map((hotspot) => ({
//       nodeId: hotspot.targetSceneId,
//       position: { yaw: `${hotspot.yaw}deg`, pitch: `${hotspot.pitch}deg` },
//       name: hotspot.linkName,
//     })),
//   }));
// }

function getVisibleItems(
  cat: Cat,
  filtered: GalleryItem[],
  expanded: boolean,
  cmsPreviewSets?: Partial<Record<Cat, string[]>>,
  itemById?: Map<string, GalleryItem>,
): GalleryItem[] {
  if (expanded) return filtered;

  if (cmsPreviewSets && itemById) {
    const previewIds = cmsPreviewSets[cat];
    if (previewIds?.length) {
      const picked = previewIds
        .map((id) => itemById.get(id))
        .filter((item): item is GalleryItem => Boolean(item));
      if (picked.length) return picked;
    }
  }

  const previewFilenames = previewImagesByCategory[cat];
  if (previewFilenames) {
    return previewFilenames.map(offwhiteItemByFilename);
  }

  return filtered.slice(0, 4);
}

function GalleryPage() {
  const { data: cms } = useGalleryCms();

  const items = useMemo(
    () => (cms?.usesCmsPhotos ? cms.items : fallbackItems),
    [cms],
  );

  const activeFilters = useMemo(
    () => (cms?.usesCmsPhotos ? cms.filters : filters),
    [cms],
  );

  const itemById = useMemo(() => {
    if (!cms?.usesCmsPhotos) return undefined;
    return new Map(items.filter((item) => item.id).map((item) => [item.id!, item]));
  }, [cms?.usesCmsPhotos, items]);

  // Hidden for now — restore with the 360° gallery tab:
  // const tourScenes = useMemo(
  //   () => (cms?.tourScenes.length ? cmsTourToVirtualScenes(cms.tourScenes) : undefined),
  //   [cms?.tourScenes],
  // );

  const headerEyebrow = cms?.header.eyebrow ?? "Gallery";
  const headerHeadline = cms?.header.headline ?? "Moments, captured.";
  const expandLabel = cms?.toggle.expandLabel ?? "View Full Gallery";
  const collapseLabel = cms?.toggle.collapseLabel ?? "Show Less";
  const [cat, setCat] = useState<Cat>("All");
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const filtered = cat === "All" ? items : items.filter((i) => i.cat === cat);
  const visible = getVisibleItems(cat, filtered, expanded, cms?.previewSets, itemById);

  // Warm remaining gallery images slowly so "View Full Gallery" stays smooth.
  useEffect(() => {
    if (expanded) return;
    const filteredItems = cat === "All" ? items : items.filter((i) => i.cat === cat);
    const preview = getVisibleItems(cat, filteredItems, false, cms?.previewSets, itemById);
    const visibleSet = new Set(preview.map((item) => item.src));
    const rest = items.map((item) => item.src).filter((src) => src && !visibleSet.has(src));
    return startSlowImagePreload(rest, {
      concurrency: 1,
      gapMs: 350,
      startAfterMs: 900,
    });
  }, [items, cat, expanded, cms?.previewSets, itemById]);

  useEffect(() => {
    setExpanded(false);
  }, [cat]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <section className="bg-[var(--cream)] pt-32 pb-24 lg:pt-40 lg:pb-32">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          <Reveal className="text-left">
            <p className="text-[11px] uppercase tracking-[0.34em] font-medium text-[var(--gold)]">
              {headerEyebrow}
            </p>
            <h1 className="mt-5 heading-hero text-[clamp(2.4rem,4.5vw,3.8rem)] text-[var(--ink)] leading-[1.1]">
              {headerHeadline}
            </h1>
          </Reveal>

          <Reveal delay={0.1} className="mt-12">
            <nav
              className="flex flex-wrap justify-start gap-x-6 gap-y-3 sm:gap-x-8"
              aria-label="Gallery filters"
            >
              {activeFilters.map((f) => {
                const isActive = cat === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setCat(f.key)}
                    className={`relative px-1 py-2 text-[10px] sm:text-[11px] uppercase tracking-[0.24em] font-medium transition-colors duration-300 ${
                      isActive ? "text-[var(--ink)]" : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="gallery-tab-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-px bg-[var(--ink)]"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="relative">{f.label}</span>
                  </button>
                );
              })}
            </nav>
          </Reveal>

          <AnimatePresence mode="wait">
            {/* 360° tour panel — restore with the 360° tab:
            {cat === "360 View" ? (
              <motion.div
                key="360-tour"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease }}
                className="mt-14"
              >
                <Reveal>
                  <VirtualTour360 scenes={tourScenes} />
                </Reveal>
              </motion.div>
            ) : ( */}
              <motion.div
                key={`${cat}-${expanded ? "full" : "preview"}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease }}
                className={
                  expanded
                    ? "mt-14 columns-2 sm:columns-3 lg:columns-4 gap-3 sm:gap-4"
                    : "mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
                }
              >
                {visible.map((it, i) => (
                  <motion.button
                    key={it.id ?? `${it.src}-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: expanded ? Math.min(i * 0.03, 0.45) : i * 0.07, ease }}
                    onClick={() => setOpen(it.src)}
                    className={
                      expanded
                        ? "group relative mb-3 sm:mb-4 w-full break-inside-avoid overflow-hidden cursor-zoom-in block"
                        : "group relative overflow-hidden aspect-[3/4] cursor-zoom-in"
                    }
                  >
                    <img
                      src={it.src}
                      alt={it.label}
                      loading="lazy"
                      className={
                        expanded
                          ? "block w-full h-auto transition-transform duration-[1.4s] ease-out group-hover:scale-[1.02]"
                          : "absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-[1.04]"
                      }
                    />
                  </motion.button>
                ))}
              </motion.div>
            {/* )} */}
          </AnimatePresence>

          {/* Was: cat !== "360 View" && filtered.length > 4 */}
          {filtered.length > 4 && (
            <Reveal delay={0.15} className="mt-16 text-center">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] font-semibold text-[var(--ink)] hover:text-[var(--cocoa)] transition-colors duration-300"
              >
                {expanded ? collapseLabel : expandLabel}
                <ArrowRight
                  size={14}
                  strokeWidth={1.5}
                  className={`transition-transform duration-300 ${expanded ? "rotate-90" : "group-hover:translate-x-1"}`}
                />
              </button>
            </Reveal>
          )}
        </div>
      </section>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setOpen(null)}
          >
            <button
              aria-label="Close"
              className="absolute top-5 right-5 text-white/90 hover:text-white p-2 transition-colors"
              onClick={() => setOpen(null)}
            >
              <X size={28} />
            </button>
            <motion.img
              key={open}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              transition={{ duration: 0.4, ease }}
              src={open}
              alt=""
              className="max-h-[90vh] max-w-[92vw] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
