/**
 * URLs for background gallery warmup (same folders the gallery page draws from).
 * Loaded via dynamic import so the homepage stays lean until idle.
 */

const offwhiteModules = import.meta.glob("../offwhite images/*.{jpg,JPG,jpeg,JPEG,png,PNG}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const assetModules = import.meta.glob("../assets/**/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

export function getGalleryWarmupUrls(): string[] {
  return [...Object.values(offwhiteModules), ...Object.values(assetModules)].filter(Boolean);
}
