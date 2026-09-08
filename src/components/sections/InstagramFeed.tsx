import { useEffect, useId } from "react";
import { Instagram } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Eyebrow } from "@/components/Eyebrow";

const PROFILE_URL = "https://www.instagram.com/offwhitegoa?utm_source=qr";
const SOCIABLEKIT_SCRIPT = "https://widgets.sociablekit.com/instagram-feed/widget.js";
const SOCIABLEKIT_EMBED_ID = "25711613";
const STYLE_ID = "offwhite-sociablekit-ig-theme-v4";
const MAX_POSTS = 6;

/** Match Instagram grid: tight 2px gutters, sharp edges, 4:5 portrait tiles. */
const SOCIABLEKIT_THEME_CSS = `
  .sociablekit-instagram-feed,
  .sociablekit-instagram-feed .sk-instagram-feed,
  .sociablekit-instagram-feed .sk-ww-ig-feed-container,
  .sociablekit-instagram-feed .sk-ig-all-posts,
  .sociablekit-instagram-feed [class*="sk-ww"],
  .sociablekit-instagram-feed [class*="feed-container"] {
    background: transparent !important;
    background-color: transparent !important;
    background-image: none !important;
    border: none !important;
    border-width: 0 !important;
    box-shadow: none !important;
    outline: none !important;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
    max-width: none !important;
    overflow: visible !important;
  }

  /* Own profile + CTA already rendered — hide SociableKit chrome */
  .sociablekit-instagram-feed .instagram-user-root-container,
  .sociablekit-instagram-feed .sk-instagram-profile-pic_container,
  .sociablekit-instagram-feed .sk-ig-profile-info,
  .sociablekit-instagram-feed .sk-ig-profile-info-container,
  .sociablekit-instagram-feed .sk-ig-profile-bio-container,
  .sociablekit-instagram-feed .sk_branding,
  .sociablekit-instagram-feed .first_loading_animation,
  .sociablekit-instagram-feed .sk-instagram-feed-item-sizer,
  .sociablekit-instagram-feed a[href*="sociablekit.com"],
  .sociablekit-instagram-feed [class*="load-more"],
  .sociablekit-instagram-feed [class*="LoadMore"],
  .sociablekit-instagram-feed [class*="sk-load"],
  .sociablekit-instagram-feed .sk-ww-load-more-posts,
  .sociablekit-instagram-feed button {
    display: none !important;
    visibility: hidden !important;
    height: 0 !important;
    max-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
  }

  .sociablekit-instagram-feed .sk-ig-all-posts {
    display: grid !important;
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    gap: 2px !important;
    column-gap: 2px !important;
    row-gap: 2px !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    align-items: stretch !important;
    background: transparent !important;
    overflow: hidden !important;
  }

  @media (min-width: 640px) {
    .sociablekit-instagram-feed .sk-ig-all-posts {
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      gap: 2px !important;
      column-gap: 2px !important;
      row-gap: 2px !important;
    }
  }

  .sociablekit-instagram-feed .sk-instagram-feed-item {
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    min-height: 0 !important;
    left: auto !important;
    top: auto !important;
    position: relative !important;
    aspect-ratio: 4 / 5 !important;
    border-radius: 0 !important;
    overflow: hidden !important;
    box-shadow: none !important;
    background: #000 !important;
    padding: 0 !important;
    margin: 0 !important;
    cursor: pointer !important;
  }

  .sociablekit-instagram-feed .sk-instagram-feed-item > .sk-img-sizer {
    display: none !important;
  }

  .sociablekit-instagram-feed .sk-instagram-feed-item > .sk-ig-post-img {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    max-width: none !important;
    max-height: none !important;
    object-fit: cover !important;
    object-position: center center !important;
    display: block !important;
    border-radius: 0 !important;
    transform: none !important;
  }

  .sociablekit-instagram-feed .sk-ig-post-hover,
  .sociablekit-instagram-feed .white-popup,
  .sociablekit-instagram-feed .sk-pop-ig-post {
    display: none !important;
  }
`;

function useSociableKitInstagram() {
  useEffect(() => {
    document.querySelectorAll('[id^="offwhite-sociablekit-ig-theme"]').forEach((node) => {
      if (node.id !== STYLE_ID) node.remove();
    });
    let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = SOCIABLEKIT_THEME_CSS;

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SOCIABLEKIT_SCRIPT}"]`,
    );
    if (existing) {
      existing.remove();
    }

    const script = document.createElement("script");
    script.src = SOCIABLEKIT_SCRIPT;
    script.defer = true;
    document.body.appendChild(script);

    const clearShell = (el: HTMLElement) => {
      el.style.setProperty("background", "transparent", "important");
      el.style.setProperty("background-color", "transparent", "important");
      el.style.setProperty("background-image", "none", "important");
      el.style.setProperty("border", "none", "important");
      el.style.setProperty("border-width", "0", "important");
      el.style.setProperty("box-shadow", "none", "important");
      el.style.setProperty("padding", "0", "important");
      el.style.setProperty("margin", "0", "important");
    };

    const hideEl = (el: HTMLElement) => {
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("height", "0", "important");
      el.style.setProperty("margin", "0", "important");
      el.style.setProperty("padding", "0", "important");
      el.style.setProperty("overflow", "hidden", "important");
      el.style.setProperty("opacity", "0", "important");
    };

    const syncFeed = () => {
      document
        .querySelectorAll<HTMLElement>(
          [
            ".sociablekit-instagram-feed",
            ".sociablekit-instagram-feed .sk-instagram-feed",
            ".sociablekit-instagram-feed .sk-ww-ig-feed-container",
            ".sociablekit-instagram-feed .sk-ig-all-posts",
          ].join(", "),
        )
        .forEach(clearShell);

      document
        .querySelectorAll<HTMLElement>(
          [
            ".sociablekit-instagram-feed .instagram-user-root-container",
            ".sociablekit-instagram-feed .sk_branding",
            ".sociablekit-instagram-feed .first_loading_animation",
            ".sociablekit-instagram-feed .sk-instagram-feed-item-sizer",
            '.sociablekit-instagram-feed a[href*="sociablekit.com"]',
            ".sociablekit-instagram-feed .sk-ww-load-more-posts",
            '.sociablekit-instagram-feed [class*="load-more"]',
          ].join(", "),
        )
        .forEach(hideEl);

      // Hide "Load more" text nodes SociableKit injects without a stable class
      document
        .querySelectorAll<HTMLElement>(".sociablekit-instagram-feed a, .sociablekit-instagram-feed button, .sociablekit-instagram-feed div")
        .forEach((el) => {
          const text = (el.textContent || "").trim().toLowerCase();
          if (text === "load more posts" || text === "load more") hideEl(el);
        });

      // Limit to 6 by item index — NOT nth-child (sizer sibling was hiding the 6th post)
      const items = document.querySelectorAll<HTMLElement>(
        ".sociablekit-instagram-feed .sk-ig-all-posts > .sk-instagram-feed-item",
      );
      items.forEach((item, index) => {
        if (index >= MAX_POSTS) {
          hideEl(item);
          return;
        }
        item.style.removeProperty("display");
        item.style.setProperty("display", "block", "important");
        item.style.setProperty("visibility", "visible", "important");
        item.style.setProperty("opacity", "1", "important");
        item.style.setProperty("height", "auto", "important");
        item.style.setProperty("overflow", "hidden", "important");

        const img = item.querySelector<HTMLImageElement>("img.sk-ig-post-img");
        if (img) {
          img.style.setProperty("position", "absolute", "important");
          img.style.setProperty("inset", "0", "important");
          img.style.setProperty("width", "100%", "important");
          img.style.setProperty("height", "100%", "important");
          img.style.setProperty("object-fit", "cover", "important");
          img.style.setProperty("object-position", "center", "important");
          img.style.setProperty("border-radius", "0", "important");
          img.style.setProperty("max-width", "none", "important");
          img.style.setProperty("max-height", "none", "important");
        }
      });
    };

    const observer = new MutationObserver(() => syncFeed());
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setInterval(syncFeed, 400);
    const stop = window.setTimeout(() => window.clearInterval(timer), 20000);

    return () => {
      observer.disconnect();
      window.clearInterval(timer);
      window.clearTimeout(stop);
    };
  }, []);
}

export function InstagramFeed() {
  const titleId = useId();
  useSociableKitInstagram();

  return (
    <section
      className="relative overflow-hidden py-24 lg:py-32"
      aria-labelledby={titleId}
      style={{ background: "linear-gradient(170deg, #1a1612 0%, #2a2318 40%, #1a1612 100%)" }}
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(193,154,107,0.08)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-[radial-gradient(ellipse,rgba(193,154,107,0.06)_0%,transparent_70%)]" />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        <Reveal className="mb-16 flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-4">
            <span className="block h-px w-12 bg-gradient-to-r from-transparent to-[var(--gold)]/60" />
            <Instagram size={20} className="text-[var(--gold)]/80" />
            <span className="block h-px w-12 bg-gradient-to-l from-transparent to-[var(--gold)]/60" />
          </div>

          <Eyebrow className="!text-[var(--gold)] !mb-0 !tracking-[0.35em]">Follow Our Journey</Eyebrow>

          <h2
            id={titleId}
            className="mt-4 font-serif text-[clamp(2.4rem,4.5vw,3.8rem)] font-light tracking-wide text-white/95"
          >
            @offwhitegoa
          </h2>

          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/50 lg:text-[0.95rem]">
            A glimpse of the room, the table, and the evenings —
            curated moments from our world.
          </p>

          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-8 flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-6 py-3 backdrop-blur-sm transition-all duration-400 hover:border-[var(--gold)]/40 hover:bg-white/10"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] p-[2px]">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-[#1a1612] text-xs font-bold text-white">
                OW
              </span>
            </span>
            <span className="flex flex-col items-start">
              <span className="text-sm font-semibold tracking-wide text-white/90 transition-colors group-hover:text-[var(--gold)]">
                offwhitegoa
              </span>
              <span className="text-[0.7rem] text-white/40">The Off White Bar & Grill</span>
            </span>
          </a>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="sociablekit-instagram-feed w-full min-h-[280px] overflow-hidden">
            <div className="sk-instagram-feed" data-embed-id={SOCIABLEKIT_EMBED_ID} />
          </div>
        </Reveal>

        <Reveal delay={0.14} className="mt-14 text-center">
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full px-10 py-4 text-sm font-semibold tracking-[0.2em] text-white uppercase transition-all duration-400 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(193,154,107,0.2)]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] opacity-90 transition-opacity duration-400 group-hover:opacity-100" />
            <span className="relative flex items-center gap-2.5">
              <Instagram size={18} aria-hidden />
              Follow on Instagram
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
