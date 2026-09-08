import { Link } from "@tanstack/react-router";
import { Reveal } from "../Reveal";
import { Eyebrow } from "../Eyebrow";
import artOnPlate1 from "../../artonplate/Gemini_Generated_Image_1sg2ez1sg2ez1sg2.jpg";
import artOnPlate2 from "../../artonplate/Gemini_Generated_Image_e83ohae83ohae83o.jpg";
import artOnPlate3 from "../../artonplate/Gemini_Generated_Image_qdh7psqdh7psqdh7.jpg";
import artOnPlate4 from "../../artonplate/Gemini_Generated_Image_zij19jzij19jzij1.jpg";
import { useHomepageCms } from "@/lib/homepage-cms";
import { cmsSrc } from "@/lib/cms-src";

const fallbackItems = [
  { img: artOnPlate1, name: "Lemon Herb Chicken", notes: "Herb crust · Mash · Saffron coulis" },
  { img: artOnPlate2, name: "Red Wine Sangria", notes: "Apple · Lime · Seasonal fruit" },
  { img: artOnPlate3, name: "Herb Crusted Sea Bass", notes: "Spinach · Mushroom · Citrus" },
  { img: artOnPlate4, name: "Tender Beef Fillet", notes: "Peppercorn cream · Mash · Rosemary" },
];

export function Dishes() {
  const { data, isPending } = useHomepageCms();
  const eyebrow = data?.dishes.eyebrow || "Signature Dishes";
  const headline = data?.dishes.headline || "Art on a Plate";
  const button = data?.dishes.button || { label: "Explore Full Menu", href: "/menu" };
  const items =
    data?.dishes.cards?.length
      ? data.dishes.cards.map((card, i) => ({
          img: cmsSrc(isPending, card.imageUrl, fallbackItems[i % fallbackItems.length].img),
          name: card.name,
          notes: card.notes,
        }))
      : fallbackItems.map((item) => ({
          ...item,
          img: cmsSrc(isPending, undefined, item.img),
        }));

  return (
    <section id="menu" className="bg-[var(--cream)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <Reveal className="text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="heading-section mt-4 text-[clamp(2rem,3.6vw,3.2rem)] text-[var(--ink)]">{headline}</h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-6 md:gap-8 lg:grid-cols-4">
          {items.map((d, i) => (
            <Reveal key={`${d.name}-${i}`} delay={i * 0.08}>
              <div className="group text-center">
                <div className="overflow-hidden arch-top bg-[var(--cream-warm)] transition-shadow duration-500 group-hover:shadow-[0_25px_60px_-25px_rgba(43,33,24,0.4)]">
                  {d.img ? (
                  <img
                    src={d.img}
                    alt={d.name}
                    width={768}
                    height={896}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  ) : null}
                </div>
                <h3 className="mt-6 text-xl text-[var(--ink)]">{d.name}</h3>
                <div className="mx-auto mt-2 h-px w-8 bg-[var(--gold)]/60" />
                <p className="mt-3 text-[12px] tracking-[0.12em] text-[var(--ink-muted)]">{d.notes}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14 text-center">
          <Link to={button.href.startsWith("/") ? button.href : "/menu"} className="btn-outline">
            {button.label}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
