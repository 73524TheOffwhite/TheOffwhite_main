import { useEffect } from "react";
import { useGalleryCms } from "@/lib/gallery-cms";
import { startSlowImagePreload } from "@/lib/slow-image-preload";

/**
 * After first paint, gently cache gallery images in the background
 * so "View Full Gallery" does not hitch when opened.
 */
export function GalleryImageWarmup() {
  const { data: cms } = useGalleryCms();

  useEffect(() => {
    let cancelled = false;
    let stop: (() => void) | undefined;

    async function run() {
      const urls: string[] = [];

      if (cms?.usesCmsPhotos && cms.items.length) {
        urls.push(...cms.items.map((item) => item.src));
      } else {
        // Defer pulling fallback gallery modules until idle warmup starts
        const mod = await import("@/data/gallery-warmup-urls");
        if (cancelled) return;
        urls.push(...mod.getGalleryWarmupUrls());
      }

      if (cancelled || !urls.length) return;
      stop = startSlowImagePreload(urls, {
        concurrency: 1,
        gapMs: 500,
        startAfterMs: 2800,
      });
    }

    void run();

    return () => {
      cancelled = true;
      stop?.();
    };
  }, [cms]);

  return null;
}
