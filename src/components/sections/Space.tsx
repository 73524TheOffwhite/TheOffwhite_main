import { Link } from "@tanstack/react-router";
import { Reveal } from "../Reveal";
import { Eyebrow } from "../Eyebrow";
import bar from "@/assets/space-bar.jpg";
import archway from "@/assets/space-archway.jpg";
import mural from "@/assets/space-mural.jpg";
import dining from "@/assets/space-dining.jpg";
import { useHomepageCms } from "@/lib/homepage-cms";
import { cmsSrc } from "@/lib/cms-src";

const fallbackItems = [
  { img: bar, label: "The Bar" },
  { img: archway, label: "The Archway Corner" },
  { img: mural, label: "The Mural Seating" },
  { img: dining, label: "The Sunlit Dining" },
];

export function Space() {
  const { data, isPending } = useHomepageCms();
  const eyebrow = data?.space.eyebrow || "The Space";
  const headline = data?.space.headline || "Every Corner Has a Story";
  const button = data?.space.button || { label: "View Gallery", href: "/gallery" };
  const items =
    data?.space.cards?.length
      ? data.space.cards.map((card, i) => ({
          img: cmsSrc(isPending, card.imageUrl, fallbackItems[i % fallbackItems.length].img),
          label: card.label,
        }))
      : fallbackItems.map((item) => ({
          ...item,
          img: cmsSrc(isPending, undefined, item.img),
        }));

  return (
    <section className="bg-[var(--cream-warm)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <Reveal className="text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4 text-[clamp(2rem,3.6vw,3.2rem)] text-[var(--ink)]">{headline}</h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-5 md:gap-6 lg:grid-cols-4">
          {items.map((s, i) => (
            <Reveal key={`${s.label}-${i}`} delay={i * 0.08}>
              <div className="group relative overflow-hidden rounded-md aspect-[4/5] cursor-pointer">
                {s.img ? (
                <img
                  src={s.img}
                  alt={s.label}
                  width={1024}
                  height={896}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-[1.08]"
                />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-500 group-hover:from-black/85" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <h3 className="text-xl lg:text-2xl">{s.label}</h3>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <Link to={button.href.startsWith("/") ? button.href : "/gallery"} className="btn-outline">
            {button.label}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
