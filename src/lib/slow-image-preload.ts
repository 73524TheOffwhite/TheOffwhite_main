/** Sequentially warm image URLs so expand/view-more feels instant without stealing bandwidth. */

export type SlowImagePreloadOptions = {
  /** Max parallel downloads (keep low). Default 1. */
  concurrency?: number;
  /** Pause between starting each image. Default 450ms. */
  gapMs?: number;
  /** Wait before starting (let first paint / LCP finish). Default 2500ms. */
  startAfterMs?: number;
  /** Skip when Save-Data or very slow network. Default true. */
  respectSaveData?: boolean;
};

function shouldSkip(respectSaveData: boolean) {
  if (typeof navigator === "undefined") return true;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
    .connection;
  if (respectSaveData && conn?.saveData) return true;
  if (conn?.effectiveType === "slow-2g" || conn?.effectiveType === "2g") return true;
  return false;
}

function loadOne(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    const done = () => resolve();
    img.onload = done;
    img.onerror = done;
    img.src = src;
  });
}

/**
 * Slowly cache gallery (or any) images in the browser.
 * Returns a cancel function.
 */
export function startSlowImagePreload(
  urls: string[],
  options: SlowImagePreloadOptions = {},
): () => void {
  const {
    concurrency = 1,
    gapMs = 450,
    startAfterMs = 2500,
    respectSaveData = true,
  } = options;

  if (typeof window === "undefined") return () => {};
  if (shouldSkip(respectSaveData)) return () => {};

  const unique = [...new Set(urls.filter(Boolean))];
  if (!unique.length) return () => {};

  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let gapTimer: ReturnType<typeof setTimeout> | undefined;
  let index = 0;
  let active = 0;

  const pump = () => {
    if (cancelled) return;
    while (active < concurrency && index < unique.length) {
      const src = unique[index++];
      active++;
      void loadOne(src).finally(() => {
        active--;
        if (cancelled) return;
        if (index >= unique.length && active === 0) return;
        gapTimer = setTimeout(pump, gapMs);
      });
    }
  };

  const start = () => {
    if (cancelled) return;
    pump();
  };

  if (typeof requestIdleCallback === "function") {
    const idleId = requestIdleCallback(
      () => {
        timer = setTimeout(start, Math.max(0, startAfterMs - 500));
      },
      { timeout: startAfterMs + 2000 },
    );
    return () => {
      cancelled = true;
      cancelIdleCallback(idleId);
      if (timer) clearTimeout(timer);
      if (gapTimer) clearTimeout(gapTimer);
    };
  }

  timer = setTimeout(start, startAfterMs);
  return () => {
    cancelled = true;
    if (timer) clearTimeout(timer);
    if (gapTimer) clearTimeout(gapTimer);
  };
}
